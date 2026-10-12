import { Injectable } from '@nestjs/common';
import {
	IsNotEmpty,
	IsString,
	IsUUID,
} from 'class-validator';

import { MikroOrmUnitOfWork } from '../../../../../lib/database/mikro.orm.unit.of.work';
import { CommandResult } from '../../../../../lib/entity/command/command.result';
import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { ValidationResult } from '../../../../../lib/validator/model/validation.result';
import { Validator } from '../../../infrastructure/validation/validator/validator';
import { Currency } from '../../../shared/commerce/model/currency';
import { Money } from '../../../shared/commerce/model/money.entity';
import { AcquisitionCode } from '../../education/model/acquisition.code.entity';
import { digestAcquisitionCode } from '../../education/model/acquisition.code.util';
import { ClassroomGameListing , ClassroomGameListingDesignatedPayor } from '../../education/model/classroom.game.listing.entity';
import { AcquisitionCodeRepository } from '../../education/repository/acquisition.code.repository';
import { ClassroomGameListingRepository } from '../../education/repository/classroom.game.listing.repository';
import { UserEntityRepository } from '../../user/repository/user.entity.repository';
import { GameAcquisition, GameAcquisitionMechanism } from '../model/game.acquisition.entity';
import {
	GameAcquisitionEvent,
	GameAcquisitionEventActorType,
	GameAcquisitionEventType
} from '../model/game.acquisition.event.entity';
import { GameLicense } from '../model/game.license.entity';
import { GameAcquisitionEventRepository } from '../repository/game.acquisition.event.repository';
import { GameAcquisitionRepository } from '../repository/game.acquisition.repository';
import { GameLicenseRepository } from '../repository/game.license.repository';

export class RedeemAcquisitionCodeCommandData extends StaticFactory {

	@IsUUID()
	userId!: string;

	@IsUUID()
	classroomGameListingId!: string;

	@IsString()
	@IsNotEmpty()
	code!: string;

}

export class RedeemAcquisitionCodeCommandResult extends CommandResult {

	classroomGameListing?: ClassroomGameListing;

	license?: GameLicense;

	static invalidCodeFail() {
		return this.fail({
			validationResult: ValidationResult.createFromErrorMessage('Acquisition code is invalid or unavailable'),
		});
	}

	static unavailableFail() {
		return this.fail({
			validationResult: ValidationResult.createFromErrorMessage('Classroom game listing is unavailable'),
		});
	}

	static alreadyAcquiredFail() {
		return this.fail({
			validationResult: ValidationResult.createFromErrorMessage('Classroom game listing already acquired'),
		});
	}

}

@Injectable()
export class RedeemAcquisitionCodeCommand {

	constructor(
		private readonly validator: Validator,
		private readonly acquisitionCodeRepository: AcquisitionCodeRepository,
		private readonly classroomGameListingRepository: ClassroomGameListingRepository,
		private readonly gameAcquisitionRepository: GameAcquisitionRepository,
		private readonly acquisitionEventRepository: GameAcquisitionEventRepository,
		private readonly gameLicenseRepository: GameLicenseRepository,
		private readonly unitOfWork: MikroOrmUnitOfWork,
		private readonly userRepository: UserEntityRepository,
	) {}

	async execute(data: RedeemAcquisitionCodeCommandData): Promise<RedeemAcquisitionCodeCommandResult> {
		return this.unitOfWork.transactional(() => this.executeTransactional(data));
	}

	private async executeTransactional(data: RedeemAcquisitionCodeCommandData): Promise<RedeemAcquisitionCodeCommandResult> {
		const validationResult = await this.validator.validate(data);
		if (validationResult) {
			return RedeemAcquisitionCodeCommandResult.fail({ validationResult });
		}

		const classroomGameListing = await this.classroomGameListingRepository.findForAcquisition(data.classroomGameListingId);
		const user = await this.userRepository.findOneBy({ id: data.userId });
		const acquisitionCode = await this.acquisitionCodeRepository.findForRedemption(digestAcquisitionCode(data.code));

		if (!classroomGameListing || !user || !classroomGameListing.isAvailable()) {
			return RedeemAcquisitionCodeCommandResult.unavailableFail();
		}

		if (!this.isInstitutionFunded(classroomGameListing, acquisitionCode)) {
			return RedeemAcquisitionCodeCommandResult.invalidCodeFail();
		}

		const now = new Date();
		if (acquisitionCode.expiresAt <= now) {
			return RedeemAcquisitionCodeCommandResult.invalidCodeFail();
		}

		const existingLicense = await this.gameLicenseRepository.findByUserAndClassroomGameListing(
			data.userId,
			classroomGameListing.id!,
		);
		if (existingLicense) {
			return RedeemAcquisitionCodeCommandResult.alreadyAcquiredFail();
		}

		const redemption = await this.acquisitionCodeRepository.claim(acquisitionCode, data.userId, now);
		if (!redemption) {
			return RedeemAcquisitionCodeCommandResult.invalidCodeFail();
		}

		const license = await this.gameLicenseRepository.save(GameLicense.createForDuration(
			classroomGameListing.licenseDurationDays,
			{
				classroomGameListing: classroomGameListing,
				customization: classroomGameListing.customization,
				gameVariant: classroomGameListing.gameVariant,
				user,
			},
		));

		const acquisition = await this.gameAcquisitionRepository.save(GameAcquisition.create({
			classroomGameListing: classroomGameListing,
			codeRedemption: redemption,
			license,
			mechanism: GameAcquisitionMechanism.INSTITUTION_FUNDED,
			price: Money.create({ currency: Currency.USD, minorUnitAmount: 0 }),
			user,
		}));
		await this.acquisitionEventRepository.save(GameAcquisitionEvent.create({
			acquisition,
			acquisitionCode,
			actorType: GameAcquisitionEventActorType.USER,
			actorUser: user,
			eventType: GameAcquisitionEventType.CODE_REDEEMED,
			metadata: { redemptionId: redemption.id },
		}));

		return RedeemAcquisitionCodeCommandResult.success({ classroomGameListing, license });
	}

	private isInstitutionFunded(
		classroomGameListing: ClassroomGameListing,
		acquisitionCode?: AcquisitionCode,
	): acquisitionCode is AcquisitionCode {
		return !!acquisitionCode
			&& acquisitionCode.classroomGameListing?.id === classroomGameListing.id
			&& classroomGameListing.designatedPayor === ClassroomGameListingDesignatedPayor.INSTITUTION;
	}

}
