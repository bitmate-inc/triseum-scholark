import { Injectable } from '@nestjs/common';
import { Exclude } from 'class-transformer';
import { IsUUID } from 'class-validator';

import { CommandResult } from '../../../../../lib/entity/command/command.result';
import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { ValidationResult } from '../../../../../lib/validator/model/validation.result';
import { Validator } from '../../../infrastructure/validation/validator/validator';
import { UserEntityRepository } from '../../user/repository/user.entity.repository';
import { GameAcquisition, GameAcquisitionMechanism } from '../model/game.acquisition.entity';
import { Game } from '../model/game.entity';
import { GameLicense } from '../model/game.license.entity';
import { GameAcquisitionRepository } from '../repository/game.acquisition.repository';
import { GameLicenseRepository } from '../repository/game.license.repository';
import { GameProductRepository } from '../repository/game.product.repository';


export class AcquireGameProductCommandData extends StaticFactory {

	@IsUUID()
	userId!: string;

	@IsUUID()
	gameProductId!: string;

}

export class AcquireGameProductCommandResult extends CommandResult {

	game?: Game;
	
	@Exclude()
	license?: GameLicense;

	static gameProductNotFoundFail() {
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
export class AcquireGameProductCommand {

	constructor(
		private readonly validator: Validator,
		private readonly gameProductRepository: GameProductRepository,
		private readonly gameLicenseRepository: GameLicenseRepository,
		private readonly gameAcquisitionRepository: GameAcquisitionRepository,
		private readonly userRepository: UserEntityRepository,
	) {}

	async execute(data: AcquireGameProductCommandData): Promise<AcquireGameProductCommandResult> {
		const validationResult = await this.validator.validate(data);

		if (!!validationResult) {
			return AcquireGameProductCommandResult.fail({ validationResult });
		}

		const gameProduct = await this.gameProductRepository.findForAcquisition(data.gameProductId);

		if (!gameProduct || !gameProduct.publishedAt || gameProduct.publishedAt > new Date()
			|| !gameProduct.gameVariant.gameVersion.isPublished()
			|| !gameProduct.gameVariant.gameVersion.game.isPublished()) {
			return AcquireGameProductCommandResult.gameProductNotFoundFail();
		}

		const game = gameProduct.gameVariant.gameVersion.game;

		const user = await this.userRepository.findOneBy({ id: data.userId });

		if (!user) {
			return AcquireGameProductCommandResult.userNotFoundFail();
		}

		const currentLicense = await this.gameLicenseRepository.findActiveByUserAndGameVariant(
			data.userId,
			gameProduct.gameVariant,
		);

		if (currentLicense) {
			return AcquireGameProductCommandResult.alreadyAcquiredFail();
		}

		const licenseDuration = 6 * 30 // 6 months

		let license = GameLicense.createForDuration(licenseDuration, {
			gameVariant: gameProduct.gameVariant,
			user
		});
		
		license = await this.gameLicenseRepository.save(license);
		await this.gameAcquisitionRepository.save(GameAcquisition.create({
			license,
			mechanism: GameAcquisitionMechanism.USER_PAID,
			price: gameProduct.price,
			product: gameProduct,
			user,
		}));

		return AcquireGameProductCommandResult.success({ game, license });
	}

}