import { Injectable } from '@nestjs/common';
import { Exclude } from 'class-transformer';
import { IsUUID } from 'class-validator';

import { CommandResult } from '../../../../../lib/entity/command/command.result';
import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { ValidationResult } from '../../../../../lib/validator/model/validation.result';
import { Validator } from '../../../infrastructure/validation/validator/validator';
import { UserEntityRepository } from '../../user/repository/user.entity.repository';
import { Game } from '../model/game.entity';
import { GameLicense } from '../model/game.license.entity';
import { GameLicenseRepository } from '../repository/game.license.repository';
import { GameVersionRepository } from '../repository/game.version.repository';


export class AcquireGameVersionCommandData extends StaticFactory {

	@IsUUID()
	userId!: string;

	@IsUUID()
	gameVersionId!: string;

}

export class AcquireGameVersionCommandResult extends CommandResult {

	game?: Game;
	
	@Exclude()
	license?: GameLicense;

	static gameVersionNotFoundFail() {
		return this.fail({
			validationResult: ValidationResult.createFromErrorMessage('Game version not found'),
		});
	}

	static alreadyAcquiredFail() {
		return this.fail({
			validationResult: ValidationResult.createFromErrorMessage('Game version already acquired'),
		});
	}

	static userNotFoundFail() {
		return this.fail({
			validationResult: ValidationResult.createFromErrorMessage('User not found'),
		});
	}

}

@Injectable()
export class AcquireGameVersionCommand {

	constructor(
		private readonly validator: Validator,
		private readonly gameVersionRepository: GameVersionRepository,
		private readonly gameLicenseRepository: GameLicenseRepository,
		private readonly userRepository: UserEntityRepository,
	) {}

	async execute(data: AcquireGameVersionCommandData): Promise<AcquireGameVersionCommandResult> {
		const validationResult = await this.validator.validate(data);

		if (!!validationResult) {
			return AcquireGameVersionCommandResult.fail({ validationResult });
		}

		const gameVersion = await this.gameVersionRepository.findForAcquisition(
			data.gameVersionId,
			{ relations: { game: true } }
		);

		if (!gameVersion || !gameVersion.isPublished() || !gameVersion.game?.isPublished()) {
			return AcquireGameVersionCommandResult.gameVersionNotFoundFail();
		}

		const game = gameVersion.game;

		const user = await this.userRepository.findOneBy({ id: data.userId });

		if (!user) {
			return AcquireGameVersionCommandResult.userNotFoundFail();
		}

		const currentLicense = await this.gameLicenseRepository.findActiveByUserAndGameVersion(data.userId, gameVersion);

		if (currentLicense) {
			return AcquireGameVersionCommandResult.alreadyAcquiredFail();
		}

		const licenseDuration = 6 * 30 // 6 months

		let license = GameLicense.createForDuration(licenseDuration, {
			gameVersion,
			user
		});
		
		license = await this.gameLicenseRepository.save(license);

		return AcquireGameVersionCommandResult.success({ game, license });
	}

}