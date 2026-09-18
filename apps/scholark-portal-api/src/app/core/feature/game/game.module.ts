import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';

import { GetUserLibraryQuery } from '../catalog/query/get.user.library.query';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { AcquireGameProductCommand } from './command/acquire.game.product.command';
import { GameAcquisition } from './model/game.acquisition.entity';
import { GameCustomization } from './model/game.customization.entity';
import { Game } from './model/game.entity';
import { GameLicense } from './model/game.license.entity';
import { GameProduct } from './model/game.product.entity';
import { GameTaxonomyTerm } from './model/game.taxonomy.term.entity';
import { GameVariant } from './model/game.variant.entity';
import { GameVersion } from './model/game.version.entity';
import { GetGameListQuery } from './query/get.game.list.query';
import { GameAcquisitionRepository } from './repository/game.acquisition.repository';
import { GameLicenseRepository } from './repository/game.license.repository';
import { GameProductRepository } from './repository/game.product.repository';
import { GameRepository } from './repository/game.repository';
import { GameVersionRepository } from './repository/game.version.repository';

@Global()
@Module({
	exports: [
		AcquireGameProductCommand,
		GameLicenseRepository,
		GameProductRepository,
		GameAcquisitionRepository,
		MikroOrmModule,
		GetGameListQuery,
		GetUserLibraryQuery,
	],
	imports: [
		MikroOrmModule.forFeature([
			Game,
			GameAcquisition,
			GameCustomization,
			GameLicense,
			GameProduct,
			GameTaxonomyTerm,
			GameVariant,
			GameVersion,
		]),
		TaxonomyModule,
	],
	providers: [
		AcquireGameProductCommand,
		GameLicenseRepository,
		GameProductRepository,
		GameAcquisitionRepository,
		GameRepository,
		GameVersionRepository,
		GetGameListQuery,
		GetUserLibraryQuery,
	],
})
export class GameModule {}
