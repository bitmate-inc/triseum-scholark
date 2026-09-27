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
import { AcquisitionCode } from '../../education/model/acquisition.code.entity';
import { digestAcquisitionCode } from '../../education/model/acquisition.code.util';
import { ClassroomGame } from '../../education/model/classroom.game.entity';
import { InstitutionGameOfferDesignatedPayor } from '../../education/model/institution.game.offer.entity';
import { AcquisitionCodeRepository } from '../../education/repository/acquisition.code.repository';
import { ClassroomGameRepository } from '../../education/repository/classroom.game.repository';
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
	classroomGameId!: string;

	@IsString()
	@IsNotEmpty()
	code!: string;

}

export class RedeemAcquisitionCodeCommandResult extends CommandResult {

	classroomGame?: ClassroomGame;

	license?: GameLicense;

	static invalidCodeFail() {
		return this.fail({
			validationResult: ValidationResult.createFromErrorMessage('Acquisition code is invalid or unavailable'),
		});
	}

	static unavailableFail() {
		return this.fail({
			validationResult: ValidationResult.createFromErrorMessage('Classroom game assignment is unavailable'),
		});
	}

	static alreadyAcquiredFail() {
		return this.fail({
			validationResult: ValidationResult.createFromErrorMessage('Classroom game assignment already acquired'),
		});
	}

}

@Injectable()
export class RedeemAcquisitionCodeCommand {

	constructor(
		private readonly validator: Validator,
		private readonly acquisitionCodeRepository: AcquisitionCodeRepository,
		private readonly classroomGameRepository: ClassroomGameRepository,
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

		const classroomGame = await this.classroomGameRepository.findForAcquisition(data.classroomGameId);
		const user = await this.userRepository.findOneBy({ id: data.userId });
		const acquisitionCode = await this.acquisitionCodeRepository.findForRedemption(digestAcquisitionCode(data.code));

		if (!classroomGame || !user || !classroomGame.isAvailable()) {
			return RedeemAcquisitionCodeCommandResult.unavailableFail();
		}

		if (!this.isInstitutionFunded(classroomGame, acquisitionCode)) {
			return RedeemAcquisitionCodeCommandResult.invalidCodeFail();
		}

		const now = new Date();
		if (acquisitionCode.expiresAt <= now) {
			return RedeemAcquisitionCodeCommandResult.invalidCodeFail();
		}

		const existingLicense = await this.gameLicenseRepository.findByUserAndClassroomGame(
			data.userId,
			classroomGame.id!,
		);
		if (existingLicense) {
			return RedeemAcquisitionCodeCommandResult.alreadyAcquiredFail();
		}

		const redemption = await this.acquisitionCodeRepository.claim(acquisitionCode, data.userId, now);
		if (!redemption) {
			return RedeemAcquisitionCodeCommandResult.invalidCodeFail();
		}

		const license = await this.gameLicenseRepository.save(GameLicense.createForDuration(
			classroomGame.institutionGameOffer.licenseDurationDays,
			{
				classroomGame,
				customization: classroomGame.customization,
				gameVariant: classroomGame.institutionGameOffer.gameVariant,
				user,
			},
		));

		const acquisition = await this.gameAcquisitionRepository.save(GameAcquisition.create({
			codeRedemption: redemption,
			institutionGameOffer: classroomGame.institutionGameOffer,
			license,
			mechanism: GameAcquisitionMechanism.INSTITUTION_FUNDED,
			price: classroomGame.institutionGameOffer.price,
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

		return RedeemAcquisitionCodeCommandResult.success({ classroomGame, license });
	}

	private isInstitutionFunded(
		classroomGame: ClassroomGame,
		acquisitionCode?: AcquisitionCode,
	): acquisitionCode is AcquisitionCode {
		return !!acquisitionCode
			&& acquisitionCode.classroomGame?.id === classroomGame.id
			&& classroomGame.institutionGameOffer.designatedPayor === InstitutionGameOfferDesignatedPayor.INSTITUTION;
	}

}
