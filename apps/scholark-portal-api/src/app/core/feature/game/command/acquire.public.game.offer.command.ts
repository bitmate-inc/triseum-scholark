import { Injectable } from '@nestjs/common';
import { Exclude } from 'class-transformer';
import {
	IsInt,
	IsOptional,
	IsUUID,
	Min,
} from 'class-validator';

import { CommandResult } from '../../../../../lib/entity/command/command.result';
import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { ValidationResult } from '../../../../../lib/validator/model/validation.result';
import { Validator } from '../../../infrastructure/validation/validator/validator';
import { Money } from '../../../shared/commerce/model/money.entity';
import { UserEntityRepository } from '../../user/repository/user.entity.repository';
import { GameAcquisition, GameAcquisitionMechanism } from '../model/game.acquisition.entity';
import { Game } from '../model/game.entity';
import { GameLicense } from '../model/game.license.entity';
import { GameAcquisitionRepository } from '../repository/game.acquisition.repository';
import { GameLicenseRepository } from '../repository/game.license.repository';
import { PublicGameOfferRepository } from '../repository/public.game.offer.repository';

export class AcquirePublicOfferCommandData extends StaticFactory {

	@IsUUID()
	userId!: string;

	@IsUUID()
	publicOfferId!: string;

	@IsInt()
	@IsOptional()
	@Min(1)
	licenseDurationDays?: number;

	@IsOptional()
	price?: Money;

}

export class AcquirePublicOfferCommandResult extends CommandResult {

	game?: Game;

	@Exclude()
	license?: GameLicense;

	static publicOfferNotFoundFail() {
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
export class AcquirePublicOfferCommand {

	constructor(
		private readonly validator: Validator,
		private readonly publicOfferRepository: PublicGameOfferRepository,
		private readonly gameLicenseRepository: GameLicenseRepository,
		private readonly gameAcquisitionRepository: GameAcquisitionRepository,
		private readonly userRepository: UserEntityRepository,
	) {}

	async execute(data: AcquirePublicOfferCommandData): Promise<AcquirePublicOfferCommandResult> {
		const validationResult = await this.validator.validate(data);

		if (!!validationResult) {
			return AcquirePublicOfferCommandResult.fail({ validationResult });
		}

		const publicOffer = await this.publicOfferRepository.findForAcquisition(data.publicOfferId);

		if (!publicOffer || !publicOffer.publishedAt || publicOffer.publishedAt > new Date()
			|| !publicOffer.gameVariant.gameVersion.isPublished()
			|| !publicOffer.gameVariant.gameVersion.game.isPublished()) {
			return AcquirePublicOfferCommandResult.publicOfferNotFoundFail();
		}

		const game = publicOffer.gameVariant.gameVersion.game;

		const user = await this.userRepository.findOneBy({ id: data.userId });

		if (!user) {
			return AcquirePublicOfferCommandResult.userNotFoundFail();
		}

		const currentLicense = await this.gameLicenseRepository.findActiveByUserAndGameVariant(
			data.userId,
			publicOffer.gameVariant,
		);

		if (currentLicense) {
			return AcquirePublicOfferCommandResult.alreadyAcquiredFail();
		}

		const licenseDuration = data.licenseDurationDays ?? 6 * 30;

		let license = GameLicense.createForDuration(licenseDuration, {
			gameVariant: publicOffer.gameVariant,
			user,
		});

		license = await this.gameLicenseRepository.save(license);

		const acquisitionPrice = data.price ?? publicOffer.price;

		await this.gameAcquisitionRepository.save(GameAcquisition.create({
			license,
			mechanism: GameAcquisitionMechanism.USER_PAID,
			price: acquisitionPrice,
			publicOffer,
			user,
		}));

		return AcquirePublicOfferCommandResult.success({ game, license });
	}

}