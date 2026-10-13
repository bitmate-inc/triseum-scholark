import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';

import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { AcquirePublicListingCommand } from './command/acquire.public.game.listing.command';
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
import { GameVersion } from './model/game.version.entity';
import { PublicGameListing } from './model/public.game.listing.entity';
import { PublicGameListingPriceGroup } from './model/public.game.listing.price.group.entity';
import { PublicGameListingPriceGroupLanguage } from './model/public.game.listing.price.group.language.entity';
import { StripeWebhookEvent } from './model/stripe.webhook.event.entity';
import { GetGameListQuery } from './query/get.game.list.query';
import { GameAcquisitionEventRepository } from './repository/game.acquisition.event.repository';
import { GameAcquisitionRepository } from './repository/game.acquisition.repository';
import { GameCustomizationRepository } from './repository/game.customization.repository';
import { GameLicenseRepository } from './repository/game.license.repository';
import { GamePaymentAttemptRepository } from './repository/game.payment.attempt.repository';
import { GameRepository } from './repository/game.repository';
import { GameVersionRepository } from './repository/game.version.repository';
import { PublicGameListingPriceGroupLanguageRepository } from './repository/public.game.listing.price.group.language.repository';
import { PublicGameListingPriceGroupRepository } from './repository/public.game.listing.price.group.repository';
import { PublicGameListingRepository } from './repository/public.game.listing.repository';
import { StripeWebhookEventRepository } from './repository/stripe.webhook.event.repository';

@Global()
@Module({
	exports: [
		AcquirePublicListingCommand,
		CreateGameCheckoutCommand,
		FulfillGamePaymentCommand,
		ProcessGamePaymentWebhookCommand,
		RevalidateGamePaymentAttemptCommand,
		GameLicenseRepository,
		GameCustomizationRepository,
		GameRepository,
		GameVersionRepository,
		PublicGameListingRepository,
		PublicGameListingPriceGroupRepository,
		PublicGameListingPriceGroupLanguageRepository,
		GameAcquisitionRepository,
		GameAcquisitionEventRepository,
		GamePaymentAttemptRepository,
		StripeWebhookEventRepository,
		MikroOrmModule,
		GetGameListQuery,
		CreateGameLaunchTicketCommand,
		ExpireGamePaymentAttemptCommand,
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
			PublicGameListing,
			PublicGameListingPriceGroup,
			PublicGameListingPriceGroupLanguage,
			GameTaxonomyTerm,
			GameVersion,
		]),
		TaxonomyModule,
	],
	providers: [
		AcquirePublicListingCommand,
		CreateGameCheckoutCommand,
		FulfillGamePaymentCommand,
		ProcessGamePaymentWebhookCommand,
		RevalidateGamePaymentAttemptCommand,
		GameLicenseRepository,
		GameCustomizationRepository,
		GameRepository,
		GameVersionRepository,
		PublicGameListingRepository,
		PublicGameListingPriceGroupRepository,
		PublicGameListingPriceGroupLanguageRepository,
		GameAcquisitionRepository,
		GameAcquisitionEventRepository,
		GamePaymentAttemptRepository,
		StripeWebhookEventRepository,
		GetGameListQuery,
		CreateGameLaunchTicketCommand,
		ExpireGamePaymentAttemptCommand,
	],
})
export class GameModule {}
