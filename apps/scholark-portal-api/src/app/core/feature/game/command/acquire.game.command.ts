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
import { GameRepository } from '../repository/game.repository';
import { GameVersionRepository } from '../repository/game.version.repository';


export class AcquireGameCommandData extends StaticFactory {

	@IsUUID()
	userId!: string;

	@IsUUID()
	gameId!: string;

}

export class AcquireGameCommandResult extends CommandResult {

	game?: Game;
	@Exclude()
	license?: GameLicense;

	static gameNotFoundFail() {
		return this.fail({
			validationResult: ValidationResult.createFromErrorMessage('Game not found'),
		});
	}

	static gameVersionNotFoundFail() {
		return this.fail({
			validationResult: ValidationResult.createFromErrorMessage('Game version not found'),
		});
	}

	static gameAlreadyAcquired() {
		return this.fail({
			validationResult: ValidationResult.createFromErrorMessage('Game already acquired'),
		});
	}

	static userNotFoundFail() {
		return this.fail({
			validationResult: ValidationResult.createFromErrorMessage('User not found'),
		});
	}

}

@Injectable()
export class AcquireGameCommand {

	constructor(
		private readonly validator: Validator,
		private readonly gameRepository: GameRepository,
		private readonly gameVersionRepository: GameVersionRepository,
		private readonly gameLicenseRepository: GameLicenseRepository,
		private readonly userRepository: UserEntityRepository,
	) {}

	async execute(data: AcquireGameCommandData): Promise<AcquireGameCommandResult> {
		const validationResult = await this.validator.validate(data);

		if (!!validationResult) {
			return AcquireGameCommandResult.fail({ validationResult });
		}

		const game = await this.gameRepository.findOneBy({ id: data.gameId });

		if (!game) {
			return AcquireGameCommandResult.gameNotFoundFail();
		}

		const gameVersion = await this.gameVersionRepository.findLatestPublishedByGame(game);

		if (!gameVersion) {
			return AcquireGameCommandResult.gameVersionNotFoundFail();
		}

		const user = await this.userRepository.findOneBy({ id: data.userId });

		if (!user) {
			return AcquireGameCommandResult.userNotFoundFail();
		}

		const currentLicense = await this.gameLicenseRepository.findActiveByUserAndGame(data.userId, game);

		if (currentLicense) {
			return AcquireGameCommandResult.gameAlreadyAcquired();
		}

		const licenseDuration = 6 * 30 // 6 months

		let license = GameLicense.createForDuration(licenseDuration, {
			gameVersion,
			user
		});
		
		license = await this.gameLicenseRepository.save(license);

		return AcquireGameCommandResult.success({ game, license });
	}

}
