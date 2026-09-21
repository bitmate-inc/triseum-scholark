import { Injectable } from '@nestjs/common';
import { Exclude } from 'class-transformer';
import {
	IsInt,
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
import { ClassroomGame } from '../../education/model/classroom.game.entity';
import { ClassroomGameRepository } from '../../education/repository/classroom.game.repository';
import { InstitutionContractGameOfferRepository } from '../../education/repository/institution.contract.game.offer.repository';
import { UserEntityRepository } from '../../user/repository/user.entity.repository';
import { GameAcquisition, GameAcquisitionMechanism } from '../model/game.acquisition.entity';
import { GameCustomization } from '../model/game.customization.entity';
import { GameLicense } from '../model/game.license.entity';
import { GameAcquisitionRepository } from '../repository/game.acquisition.repository';
import { GameLicenseRepository } from '../repository/game.license.repository';

export class AcquireClassroomGameCommandData extends StaticFactory {

	@IsUUID()
	userId!: string;

	@IsUUID()
	classroomGameId!: string;

	@IsInt()
	@IsOptional()
	@Min(1)
	licenseDurationDays?: number;

	@IsOptional()
	price?: Money;

	@IsOptional()
	customization?: GameCustomization;

}

export class AcquireClassroomGameCommandResult extends CommandResult {

	classroomGame?: ClassroomGame;

	@Exclude()
	license?: GameLicense;

	static classroomGameNotFoundFail() {
		return this.fail({
			validationResult: ValidationResult.createFromErrorMessage('Classroom game assignment not found'),
		});
	}

	static classroomGameUnavailableFail() {
		return this.fail({
			validationResult: ValidationResult.createFromErrorMessage('Classroom game assignment is not available'),
		});
	}

	static classroomGameAlreadyAcquiredFail() {
		return this.fail({
			validationResult: ValidationResult.createFromErrorMessage('Classroom game assignment already acquired'),
		});
	}

	static userNotFoundFail() {
		return this.fail({
			validationResult: ValidationResult.createFromErrorMessage('User not found'),
		});
	}

}

@Injectable()
export class AcquireClassroomGameCommand {

	constructor(
		private readonly validator: Validator,
		private readonly classroomGameRepository: ClassroomGameRepository,
		private readonly gameLicenseRepository: GameLicenseRepository,
		private readonly gameAcquisitionRepository: GameAcquisitionRepository,
		private readonly contractGameRepository: InstitutionContractGameOfferRepository,
		private readonly unitOfWork: MikroOrmUnitOfWork,
		private readonly userRepository: UserEntityRepository,
	) {}

	async execute(data: AcquireClassroomGameCommandData): Promise<AcquireClassroomGameCommandResult> {
		return this.unitOfWork.transactional(() => this.executeTransactional(data));
	}

	private async executeTransactional(data: AcquireClassroomGameCommandData): Promise<AcquireClassroomGameCommandResult> {
		const validationResult = await this.validator.validate(data);

		if (validationResult) {
			return AcquireClassroomGameCommandResult.fail({ validationResult });
		}

		const classroomGame = await this.classroomGameRepository.findForAcquisition(data.classroomGameId);

		if (!classroomGame) {
			return AcquireClassroomGameCommandResult.classroomGameNotFoundFail();
		}

		if (!classroomGame.isAvailable()) {
			return AcquireClassroomGameCommandResult.classroomGameUnavailableFail();
		}

		const user = await this.userRepository.findOneBy({ id: data.userId });

		if (!user) {
			return AcquireClassroomGameCommandResult.userNotFoundFail();
		}

		const activeContractGame = await this.contractGameRepository.findActiveStudentPayorByInstitutionAndGameOffer(
			classroomGame.classroom.institution,
			classroomGame.contractGameOffer,
		);

		if (!activeContractGame) {
			return AcquireClassroomGameCommandResult.classroomGameUnavailableFail();
		}

		if (classroomGame.customization
			&& classroomGame.customization.gameVersion !== classroomGame.contractGameOffer.gameVariant.gameVersion) {
			return AcquireClassroomGameCommandResult.classroomGameUnavailableFail();
		}

		const existingLicense = await this.gameLicenseRepository.findByUserAndClassroomGame(
			user.id!,
			classroomGame.id!,
		);

		if (existingLicense) {
			return AcquireClassroomGameCommandResult.classroomGameAlreadyAcquiredFail();
		}

		const customization = data.customization ?? classroomGame.customization;
		const licenseDurationDays = data.licenseDurationDays ?? classroomGame.contractGameOffer.licenseDurationDays;

		let license = GameLicense.createForDuration(
			licenseDurationDays,
			{
				classroomGame,
				customization,
				gameVariant: classroomGame.contractGameOffer.gameVariant,
				user,
			},
		);
		license = await this.gameLicenseRepository.save(license);

		const acquisitionPrice = data.price ?? classroomGame.contractGameOffer.price;

		await this.gameAcquisitionRepository.save(GameAcquisition.create({
			license,
			mechanism: GameAcquisitionMechanism.USER_PAID,
			price: acquisitionPrice,
			institutionContractGameOffer: classroomGame.contractGameOffer,
			user,
		}));

		return AcquireClassroomGameCommandResult.success({ classroomGame, license });
	}

}