import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';

import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { AcquireGameCommand } from './command/acquire.game.command';
import { GameCustomization } from './model/game.customization.entity';
import { Game } from './model/game.entity';
import { GameLicense } from './model/game.license.entity';
import { GameTaxonomyTerm } from './model/game.taxonomy.term.entity';
import { GameVersion } from './model/game.version.entity';
import { GetGameListQuery } from './query/get.game.list.query';
import { GetUserLibraryQuery } from '../catalog/query/get.user.library.query';
import { GameLicenseRepository } from './repository/game.license.repository';
import { GameRepository } from './repository/game.repository';
import { GameVersionRepository } from './repository/game.version.repository';

@Global()
@Module({
	exports: [AcquireGameCommand, MikroOrmModule, GetGameListQuery, GetUserLibraryQuery],
	imports: [
		MikroOrmModule.forFeature([
			Game,
			GameCustomization,
			GameLicense,
			GameTaxonomyTerm,
			GameVersion,
		]),
		TaxonomyModule,
	],
	providers: [
		AcquireGameCommand,
		GameLicenseRepository,
		GameRepository,
		GameVersionRepository,
		GetGameListQuery,
		GetUserLibraryQuery,
	],
})
export class GameModule {}
