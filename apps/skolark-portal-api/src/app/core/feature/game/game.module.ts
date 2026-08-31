import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';

import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { Game } from './model/game.entity';
import { GameTaxonomyTerm } from './model/game.taxonomy.term.entity';
import { GetGameListQuery } from './query/get.game.list.query';
import { GameRepository } from './repository/game.repository';

@Global()
@Module({
	exports: [MikroOrmModule, GetGameListQuery],
	imports: [MikroOrmModule.forFeature([Game, GameTaxonomyTerm]), TaxonomyModule],
	providers: [GameRepository, GetGameListQuery],
})
export class GameModule {}