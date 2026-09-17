import { Injectable } from '@nestjs/common';
import { Exclude } from 'class-transformer';
import { IsUUID } from 'class-validator';

import { MikroOrmUnitOfWork } from '../../../../../lib/database/mikro.orm.unit.of.work';
import { CommandResult } from '../../../../../lib/entity/command/command.result';
import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { ValidationResult } from '../../../../../lib/validator/model/validation.result';
import { Validator } from '../../../infrastructure/validation/validator/validator';
import { ClassroomGame } from '../../education/model/classroom.game.entity';
import { ClassroomGameLicence } from '../../education/model/classroom.game.licence.entity';
import { ClassroomGameLicenceRepository } from '../../education/repository/classroom.game.licence.repository';
import { ClassroomGameRepository } from '../../education/repository/classroom.game.repository';
import { InstitutionContractGameVersionRepository } from '../../education/repository/institution.contract.game.version.repository';
import { UserEntityRepository } from '../../user/repository/user.entity.repository';
import { GameLicense } from '../model/game.license.entity';
import { GameLicenseRepository } from '../repository/game.license.repository';

export class AcquireClassroomGameCommandData extends StaticFactory {

	@IsUUID()
	userId!: string;

	@IsUUID()
	classroomGameId!: string;

}

export class AcquireClassroomGameCommandResult extends CommandResult {

	classroomGame?: ClassroomGame;

	@Exclude()
	enrollment?: ClassroomGameLicence;
	
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
		private readonly classroomGameLicenceRepository: ClassroomGameLicenceRepository,
		private readonly gameLicenseRepository: GameLicenseRepository,
		private readonly contractGameRepository: InstitutionContractGameVersionRepository,
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

		const activeContractGame = await this.contractGameRepository.findActiveStudentPayorByInstitutionAndGameVersion(
			classroomGame.classroom.institution,
			classroomGame.contractGameVersion,
		);

		if (!activeContractGame) {
			return AcquireClassroomGameCommandResult.classroomGameUnavailableFail();
		}

		const existingEnrollment = await this.classroomGameLicenceRepository.findByClassroomGameAndUser(
			classroomGame.id!,
			user.id!,
		);

		if (existingEnrollment) {
			return AcquireClassroomGameCommandResult.classroomGameAlreadyAcquiredFail();
		}

		let license: GameLicense | undefined;
		
		if (!classroomGame.customization) {
			license = await this.gameLicenseRepository.findActiveByUserAndGameVersion(
				user.id!,
				classroomGame.contractGameVersion.gameVersion,
			);
		}

		if (!license) {
			license = GameLicense.createForDuration(classroomGame.contractGameVersion.licenseDurationDays, {
				customization: classroomGame.customization,
				gameVersion: classroomGame.contractGameVersion.gameVersion,
				user,
			});
			license = await this.gameLicenseRepository.save(license);
		}

		const enrollment = await this.classroomGameLicenceRepository.save(ClassroomGameLicence.create({
			classroomGame,
			gameLicense: license,
		}));

		return AcquireClassroomGameCommandResult.success({ classroomGame, enrollment, license });
	}

}