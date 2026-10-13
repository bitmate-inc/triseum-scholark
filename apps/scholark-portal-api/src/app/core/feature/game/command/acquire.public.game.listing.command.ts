import { LockMode } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsUUID } from 'class-validator';

import { CommandResult } from '../../../../../lib/entity/command/command.result';
import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { ValidationResult } from '../../../../../lib/validator/model/validation.result';
import { Validator } from '../../../infrastructure/validation/validator/validator';
import { UserEntityRepository } from '../../user/repository/user.entity.repository';
import { GameAcquisition, GameAcquisitionMechanism } from '../model/game.acquisition.entity';
import { Game } from '../model/game.entity';
import { GameLicense } from '../model/game.license.entity';
import { GamePaymentAttempt } from '../model/game.payment.attempt.entity';
import { GameAcquisitionRepository } from '../repository/game.acquisition.repository';
import { GameLicenseRepository } from '../repository/game.license.repository';
import { GameVersionRepository } from '../repository/game.version.repository';
import { PublicGameListingRepository } from '../repository/public.game.listing.repository';

export class AcquirePublicListingCommandData extends StaticFactory {

	@IsUUID()
	userId!: string;

	@IsUUID()
	publicListingId!: string;

	@IsNotEmpty()
	paymentAttempt!: GamePaymentAttempt;

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
		private readonly gameVersionRepository: GameVersionRepository,
	) {}

	async execute(data: AcquirePublicListingCommandData): Promise<AcquirePublicListingCommandResult> {
		const validationResult = await this.validator.validate(data);

		if (!!validationResult) {
			return AcquirePublicListingCommandResult.fail({ validationResult });
		}

		const publicListing = await this.publicListingRepository.findForAcquisition(data.publicListingId);
		const paymentAttempt = data.paymentAttempt;
		const paymentAttemptCreatedAt = paymentAttempt.createdAt;
		const listingEndAt = paymentAttempt.publicListingEndAtSnapshotted
			? paymentAttempt.publicListingEndAtSnapshot
			: publicListing?.endAt;

		if (!publicListing || !paymentAttemptCreatedAt
			|| paymentAttempt.publicListing?.id !== publicListing.id
			|| paymentAttempt.user.id !== data.userId
			|| !publicListing.canBeAcquired(paymentAttemptCreatedAt, listingEndAt)
			|| !publicListing.gameVersion.isPublished(paymentAttemptCreatedAt)
			|| !publicListing.gameVersion.game.isPublished(paymentAttemptCreatedAt)) {
			return AcquirePublicListingCommandResult.publicListingNotFoundFail();
		}

		const game = publicListing.gameVersion.game;

		const user = await this.userRepository.findOneBy({ id: data.userId });

		if (!user) {
			return AcquirePublicListingCommandResult.userNotFoundFail();
		}

		const courseType = 'standard';
		if (data.paymentAttempt.courseType !== courseType) {
			return AcquirePublicListingCommandResult.publicListingNotFoundFail();
		}
		const gameVersion = await this.gameVersionRepository.findOneBy(
			{ id: publicListing.gameVersion.id },
			{ lockMode: LockMode.PESSIMISTIC_WRITE },
		);
		if (!gameVersion) {
			return AcquirePublicListingCommandResult.publicListingNotFoundFail();
		}
		const currentLicense = await this.gameLicenseRepository.findActiveByUserAndConfiguration(
			data.userId,
			gameVersion,
			data.paymentAttempt.language,
			courseType,
		);

		if (currentLicense) {
			return AcquirePublicListingCommandResult.alreadyAcquiredFail();
		}

		let license = GameLicense.createForDuration(data.paymentAttempt.licenseDurationDays, {
			courseType,
			gameVersion,
			language: data.paymentAttempt.language,
			user,
		});

		license = await this.gameLicenseRepository.save(license);

		const acquisitionPrice = data.paymentAttempt.price;

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