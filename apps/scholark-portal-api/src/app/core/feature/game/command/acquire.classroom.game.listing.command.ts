import { Injectable } from '@nestjs/common';
import { Exclude } from 'class-transformer';
import {
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsUUID,
	Min,
} from 'class-validator';

import { MikroOrmUnitOfWork } from '../../../../../lib/database/mikro.orm.unit.of.work';
import { CommandResult } from '../../../../../lib/entity/command/command.result';
import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { ValidationResult } from '../../../../../lib/validator/model/validation.result';
import { Validator } from '../../../infrastructure/validation/validator/validator';
import { Money } from '../../../shared/commerce/model/money.entity';
import { ClassroomGameListing , ClassroomGameListingDesignatedPayor } from '../../education/model/classroom.game.listing.entity';
import { ClassroomGameListingRepository } from '../../education/repository/classroom.game.listing.repository';
import { UserEntityRepository } from '../../user/repository/user.entity.repository';
import { GameAcquisition, GameAcquisitionMechanism } from '../model/game.acquisition.entity';
import { GameCustomization } from '../model/game.customization.entity';
import { GameLicense } from '../model/game.license.entity';
import { GamePaymentAttempt } from '../model/game.payment.attempt.entity';
import { GameAcquisitionRepository } from '../repository/game.acquisition.repository';
import { GameLicenseRepository } from '../repository/game.license.repository';

export class AcquireClassroomGameListingCommandData extends StaticFactory {

	@IsUUID()
	userId!: string;

	@IsUUID()
	classroomGameListingId!: string;

	@IsNotEmpty()
	paymentAttempt!: GamePaymentAttempt;

	@IsInt()
	@IsOptional()
	@Min(1)
	licenseDurationDays?: number;

	@IsOptional()
	price?: Money;

	@IsOptional()
	customization?: GameCustomization;

}

export class AcquireClassroomGameListingCommandResult extends CommandResult {

	classroomGameListing?: ClassroomGameListing;

	@Exclude()
	acquisition?: GameAcquisition;

	@Exclude()
	license?: GameLicense;

	static classroomGameListingNotFoundFail() {
		return this.fail({
			validationResult: ValidationResult.createFromErrorMessage('Classroom game listing not found'),
		});
	}

	static classroomGameListingUnavailableFail() {
		return this.fail({
			validationResult: ValidationResult.createFromErrorMessage('Classroom game listing is not available'),
		});
	}

	static classroomGameListingAlreadyAcquiredFail() {
		return this.fail({
			validationResult: ValidationResult.createFromErrorMessage('Classroom game listing already acquired'),
		});
	}

	static userNotFoundFail() {
		return this.fail({
			validationResult: ValidationResult.createFromErrorMessage('User not found'),
		});
	}

}

@Injectable()
export class AcquireClassroomGameListingCommand {

	constructor(
		private readonly validator: Validator,
		private readonly classroomGameListingRepository: ClassroomGameListingRepository,
		private readonly gameLicenseRepository: GameLicenseRepository,
		private readonly gameAcquisitionRepository: GameAcquisitionRepository,
		private readonly unitOfWork: MikroOrmUnitOfWork,
		private readonly userRepository: UserEntityRepository,
	) {}

	async execute(data: AcquireClassroomGameListingCommandData): Promise<AcquireClassroomGameListingCommandResult> {
		return this.unitOfWork.transactional(() => this.executeTransactional(data));
	}

	private async executeTransactional(data: AcquireClassroomGameListingCommandData): Promise<AcquireClassroomGameListingCommandResult> {
		const validationResult = await this.validator.validate(data);

		if (validationResult) {
			return AcquireClassroomGameListingCommandResult.fail({ validationResult });
		}

		const classroomGameListing = await this.classroomGameListingRepository.findForAcquisition(data.classroomGameListingId);

		if (!classroomGameListing) {
			return AcquireClassroomGameListingCommandResult.classroomGameListingNotFoundFail();
		}

		if (!classroomGameListing.isAvailable()) {
			return AcquireClassroomGameListingCommandResult.classroomGameListingUnavailableFail();
		}

		const user = await this.userRepository.findOneBy({ id: data.userId });

		if (!user) {
			return AcquireClassroomGameListingCommandResult.userNotFoundFail();
		}

		if (classroomGameListing.designatedPayor !== ClassroomGameListingDesignatedPayor.STUDENT) {
			return AcquireClassroomGameListingCommandResult.classroomGameListingUnavailableFail();
		}

		if (classroomGameListing.customization
			&& classroomGameListing.customization.gameVersion !== classroomGameListing.gameVariant.gameVersion) {
			return AcquireClassroomGameListingCommandResult.classroomGameListingUnavailableFail();
		}

		const existingLicense = await this.gameLicenseRepository.findByUserAndClassroomGameListing(
			user.id!,
			classroomGameListing.id!,
		);

		if (existingLicense) {
			return AcquireClassroomGameListingCommandResult.classroomGameListingAlreadyAcquiredFail();
		}

		const customization = data.customization ?? classroomGameListing.customization;
		const licenseDurationDays = data.licenseDurationDays ?? classroomGameListing.licenseDurationDays;
		const acquisitionPrice = data.price ?? classroomGameListing.price;
		if (!acquisitionPrice) {
			return AcquireClassroomGameListingCommandResult.classroomGameListingUnavailableFail();
		}

		let license = GameLicense.createForDuration(
			licenseDurationDays,
			{
				classroomGameListing: classroomGameListing,
				customization,
				gameVariant: classroomGameListing.gameVariant,
				user,
			},
		);
		license = await this.gameLicenseRepository.save(license);

		const acquisition = await this.gameAcquisitionRepository.save(GameAcquisition.create({
			classroomGameListing: classroomGameListing,
			license,
			mechanism: GameAcquisitionMechanism.USER_PAID,
			paymentAttempt: data.paymentAttempt,
			price: acquisitionPrice,
			user,
		}));

		return AcquireClassroomGameListingCommandResult.success({ acquisition, classroomGameListing, license });
	}

}