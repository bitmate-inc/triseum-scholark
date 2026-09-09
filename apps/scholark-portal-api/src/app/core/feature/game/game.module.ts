import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';

import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { GameCustomization } from './model/game.customization.entity';
import { Game } from './model/game.entity';
import { GameLicense } from './model/game.license.entity';
import { GameTaxonomyTerm } from './model/game.taxonomy.term.entity';
import { GameVersion } from './model/game.version.entity';
import { GetGameListQuery } from './query/get.game.list.query';
import { GameRepository } from './repository/game.repository';

@Global()
@Module({
	exports: [MikroOrmModule, GetGameListQuery],
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
	providers: [GameRepository, GetGameListQuery],
})
export class GameModule {}