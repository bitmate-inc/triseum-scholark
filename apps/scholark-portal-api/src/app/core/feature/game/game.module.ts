import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';

import { GetUserLibraryQuery } from '../catalog/query/get.user.library.query';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { AcquirePublicOfferCommand } from './command/acquire.public.game.offer.command';
import { CreateGameCheckoutCommand } from './command/create.game.checkout.command';
import { ProcessGamePaymentWebhookCommand } from './command/process.game.payment.webhook.command';
import { GameAcquisition } from './model/game.acquisition.entity';
import { GameCustomization } from './model/game.customization.entity';
import { Game } from './model/game.entity';
import { GameLicense } from './model/game.license.entity';
import { GamePaymentAttempt } from './model/game.payment.attempt.entity';
import { GameTaxonomyTerm } from './model/game.taxonomy.term.entity';
import { GameVariant } from './model/game.variant.entity';
import { GameVersion } from './model/game.version.entity';
import { PublicGameOffer } from './model/public.game.offer.entity';
import { StripeWebhookEvent } from './model/stripe.webhook.event.entity';
import { GetGameLaunchQuery } from './query/get.game.launch.query';
import { GetGameListQuery } from './query/get.game.list.query';
import { GameAcquisitionRepository } from './repository/game.acquisition.repository';
import { GameLicenseRepository } from './repository/game.license.repository';
import { GamePaymentAttemptRepository } from './repository/game.payment.attempt.repository';
import { GameRepository } from './repository/game.repository';
import { GameVersionRepository } from './repository/game.version.repository';
import { PublicGameOfferRepository } from './repository/public.game.offer.repository';
import { StripeWebhookEventRepository } from './repository/stripe.webhook.event.repository';

@Global()
@Module({
	exports: [
		AcquirePublicOfferCommand,
		CreateGameCheckoutCommand,
		ProcessGamePaymentWebhookCommand,
		GameLicenseRepository,
		PublicGameOfferRepository,
		GameAcquisitionRepository,
		GamePaymentAttemptRepository,
		StripeWebhookEventRepository,
		MikroOrmModule,
		GetGameListQuery,
		GetGameLaunchQuery,
		GetUserLibraryQuery,
	],
	imports: [
		MikroOrmModule.forFeature([
			Game,
			GameAcquisition,
			GameCustomization,
			GamePaymentAttempt,
			StripeWebhookEvent,
			GameLicense,
			PublicGameOffer,
			GameTaxonomyTerm,
			GameVariant,
			GameVersion,
		]),
		TaxonomyModule,
	],
	providers: [
		AcquirePublicOfferCommand,
		CreateGameCheckoutCommand,
		ProcessGamePaymentWebhookCommand,
		GameLicenseRepository,
		PublicGameOfferRepository,
		GameAcquisitionRepository,
		GamePaymentAttemptRepository,
		StripeWebhookEventRepository,
		GameRepository,
		GameVersionRepository,
		GetGameListQuery,
		GetGameLaunchQuery,
		GetUserLibraryQuery,
	],
})
export class GameModule {}
