import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';

import { GetUserLibraryQuery } from '../catalog/query/get.user.library.query';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { AcquirePublicOfferCommand } from './command/acquire.public.game.offer.command';
import { CreateGameCheckoutCommand } from './command/create.game.checkout.command';
import { CreateGameLaunchTicketCommand } from './command/create.game.launch.ticket.command';
import { ExpireGamePaymentAttemptCommand } from './command/expire.game.payment.attempt.command';
import { FulfillGamePaymentCommand } from './command/fulfill.game.payment.command';
import { ProcessGamePaymentWebhookCommand } from './command/process.game.payment.webhook.command';
import { RevalidateGamePaymentAttemptCommand } from './command/revalidate.game.payment.attempt.command';
import { GameAcquisition } from './model/game.acquisition.entity';
import { GameAcquisitionEvent } from './model/game.acquisition.event.entity';
import { GameCustomization } from './model/game.customization.entity';
import { Game } from './model/game.entity';
import { GameLicense } from './model/game.license.entity';
import { GamePaymentAttempt } from './model/game.payment.attempt.entity';
import { GameTaxonomyTerm } from './model/game.taxonomy.term.entity';
import { GameVariant } from './model/game.variant.entity';
import { GameVersion } from './model/game.version.entity';
import { PublicGameOffer } from './model/public.game.offer.entity';
import { StripeWebhookEvent } from './model/stripe.webhook.event.entity';
import { GetGameListQuery } from './query/get.game.list.query';
import { GameAcquisitionEventRepository } from './repository/game.acquisition.event.repository';
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
		FulfillGamePaymentCommand,
		ProcessGamePaymentWebhookCommand,
		RevalidateGamePaymentAttemptCommand,
		GameLicenseRepository,
		PublicGameOfferRepository,
		GameAcquisitionRepository,
		GameAcquisitionEventRepository,
		GamePaymentAttemptRepository,
		StripeWebhookEventRepository,
		MikroOrmModule,
		GetGameListQuery,
		CreateGameLaunchTicketCommand,
		ExpireGamePaymentAttemptCommand,
		GetUserLibraryQuery,
	],
	imports: [
		MikroOrmModule.forFeature([
			Game,
			GameAcquisition,
			GameAcquisitionEvent,
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
		FulfillGamePaymentCommand,
		ProcessGamePaymentWebhookCommand,
		RevalidateGamePaymentAttemptCommand,
		GameLicenseRepository,
		PublicGameOfferRepository,
		GameAcquisitionRepository,
		GameAcquisitionEventRepository,
		GamePaymentAttemptRepository,
		StripeWebhookEventRepository,
		GameRepository,
		GameVersionRepository,
		GetGameListQuery,
		CreateGameLaunchTicketCommand,
		ExpireGamePaymentAttemptCommand,
		GetUserLibraryQuery,
	],
})
export class GameModule {}
