import { Injectable } from '@nestjs/common';
import { Exclude } from 'class-transformer';
import {
	IsInt,
	IsNotEmpty,
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
import { GamePaymentAttempt } from '../model/game.payment.attempt.entity';
import { GameAcquisitionRepository } from '../repository/game.acquisition.repository';
import { GameLicenseRepository } from '../repository/game.license.repository';
import { PublicGameListingRepository } from '../repository/public.game.listing.repository';

export class AcquirePublicListingCommandData extends StaticFactory {

	@IsUUID()
	userId!: string;

	@IsUUID()
	publicListingId!: string;

	@IsNotEmpty()
	paymentAttempt!: GamePaymentAttempt;

	@IsInt()
	@IsOptional()
	@Min(1)
	licenseDurationDays?: number;

	@IsOptional()
	price?: Money;

}

export class AcquirePublicListingCommandResult extends CommandResult {

	game?: Game;

	@Exclude()
	acquisition?: GameAcquisition;

	@Exclude()
	license?: GameLicense;

	static publicListingNotFoundFail() {
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
export class AcquirePublicListingCommand {

	constructor(
		private readonly validator: Validator,
		private readonly publicListingRepository: PublicGameListingRepository,
		private readonly gameLicenseRepository: GameLicenseRepository,
		private readonly gameAcquisitionRepository: GameAcquisitionRepository,
		private readonly userRepository: UserEntityRepository,
	) {}

	async execute(data: AcquirePublicListingCommandData): Promise<AcquirePublicListingCommandResult> {
		const validationResult = await this.validator.validate(data);

		if (!!validationResult) {
			return AcquirePublicListingCommandResult.fail({ validationResult });
		}

		const publicListing = await this.publicListingRepository.findForAcquisition(data.publicListingId);

		if (!publicListing || !publicListing.publishedAt || publicListing.publishedAt > new Date()
			|| !publicListing.gameVariant.gameVersion.isPublished()
			|| !publicListing.gameVariant.gameVersion.game.isPublished()) {
			return AcquirePublicListingCommandResult.publicListingNotFoundFail();
		}

		const game = publicListing.gameVariant.gameVersion.game;

		const user = await this.userRepository.findOneBy({ id: data.userId });

		if (!user) {
			return AcquirePublicListingCommandResult.userNotFoundFail();
		}

		const currentLicense = await this.gameLicenseRepository.findActiveByUserAndGameVariant(
			data.userId,
			publicListing.gameVariant,
		);

		if (currentLicense) {
			return AcquirePublicListingCommandResult.alreadyAcquiredFail();
		}

		const licenseDuration = data.licenseDurationDays ?? 6 * 30;

		let license = GameLicense.createForDuration(licenseDuration, {
			gameVariant: publicListing.gameVariant,
			user,
		});

		license = await this.gameLicenseRepository.save(license);

		const acquisitionPrice = data.price ?? publicListing.price;

		const acquisition = await this.gameAcquisitionRepository.save(GameAcquisition.create({
			license,
			mechanism: GameAcquisitionMechanism.USER_PAID,
			paymentAttempt: data.paymentAttempt,
			price: acquisitionPrice,
			publicListing,
			user,
		}));

		return AcquirePublicListingCommandResult.success({ acquisition, game, license });
	}

}