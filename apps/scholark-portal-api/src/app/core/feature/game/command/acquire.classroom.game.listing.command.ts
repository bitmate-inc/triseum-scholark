import { Injectable } from '@nestjs/common';
import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsUUID } from 'class-validator';

import { MikroOrmUnitOfWork } from '../../../../../lib/database/mikro.orm.unit.of.work';
import { CommandResult } from '../../../../../lib/entity/command/command.result';
import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { ValidationResult } from '../../../../../lib/validator/model/validation.result';
import { Validator } from '../../../infrastructure/validation/validator/validator';
import { ClassroomGameListing , ClassroomGameListingDesignatedPayor } from '../../education/model/classroom.game.listing.entity';
import { ClassroomGameListingRepository } from '../../education/repository/classroom.game.listing.repository';
import { UserEntityRepository } from '../../user/repository/user.entity.repository';
import { GameAcquisition, GameAcquisitionMechanism } from '../model/game.acquisition.entity';
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

		const classroomGameListing = await this.classroomGameListingRepository.findForLicenseIssuance(data.classroomGameListingId);
		const paymentAttempt = data.paymentAttempt;
		const paymentAttemptCreatedAt = paymentAttempt.createdAt;

		if (!classroomGameListing || !paymentAttemptCreatedAt
			|| !classroomGameListing.canBeAcquired(paymentAttemptCreatedAt)
			|| paymentAttempt.classroomGameListing?.id !== classroomGameListing.id
			|| paymentAttempt.user.id !== data.userId
			|| paymentAttempt.language !== classroomGameListing.language
			|| paymentAttempt.courseType !== classroomGameListing.courseType
			|| paymentAttempt.licenseDurationDays !== classroomGameListing.licenseDurationDays
			|| paymentAttempt.customization?.id !== classroomGameListing.customization?.id) {
			return AcquireClassroomGameListingCommandResult.classroomGameListingNotFoundFail();
		}

		const user = await this.userRepository.findOneBy({ id: data.userId });

		if (!user) {
			return AcquireClassroomGameListingCommandResult.userNotFoundFail();
		}

		if (classroomGameListing.designatedPayor !== ClassroomGameListingDesignatedPayor.STUDENT) {
			return AcquireClassroomGameListingCommandResult.classroomGameListingUnavailableFail();
		}

		if (paymentAttempt.customization
			&& (!paymentAttempt.customization.isPublished(paymentAttemptCreatedAt)
				|| paymentAttempt.customization.gameVersion.id !== classroomGameListing.gameVersion.id)) {
			return AcquireClassroomGameListingCommandResult.classroomGameListingUnavailableFail();
		}

		const existingLicense = await this.gameLicenseRepository.findByUserAndClassroomGameListing(
			user.id!,
			classroomGameListing.id!,
		);

		if (existingLicense) {
			return AcquireClassroomGameListingCommandResult.classroomGameListingAlreadyAcquiredFail();
		}

		const customization = paymentAttempt.customization;
		const licenseDurationDays = paymentAttempt.licenseDurationDays;
		const acquisitionPrice = paymentAttempt.price;
		if (!acquisitionPrice) {
			return AcquireClassroomGameListingCommandResult.classroomGameListingUnavailableFail();
		}

		let license = GameLicense.createForDuration(
			licenseDurationDays,
			{
				classroomGameListing: classroomGameListing,
				customization,
				courseType: data.paymentAttempt.courseType,
				gameVersion: classroomGameListing.gameVersion,
				language: data.paymentAttempt.language,
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