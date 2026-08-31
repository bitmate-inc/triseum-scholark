import { Global, Module } from '@nestjs/common';

import { GameModule } from '../game/game.module';
import { GetCatalogGameListQuery } from './query/get.catalog.game.list.query';
import { GetFeaturedGameListQuery } from './query/get.featured.game.list.query';
import { GetGameQuery } from './query/get.game.query';

@Global()
@Module({
	exports: [GetCatalogGameListQuery, GetFeaturedGameListQuery, GetGameQuery],
	imports: [GameModule],
	providers: [GetCatalogGameListQuery, GetFeaturedGameListQuery, GetGameQuery],
})
export class CatalogModule {}
