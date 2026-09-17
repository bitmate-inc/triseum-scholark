import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Type } from 'class-transformer';

import { GetOneQueryData } from '../../../../../lib/entity/query/get.one.query';
import { GetOneFilterByDto, IncludeDto } from '../../../../../lib/entity/query/query.dto';
import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { Game } from '../../game/model/game.entity';
import { GameProduct } from '../../game/model/game.product.entity';
import { GameVersion } from '../../game/model/game.version.entity';

export class GetGameFilterByDto extends GetOneFilterByDto {

	declare id?: Game['id'];
	slug?: string;

}

export class GetGameIncludeDto extends IncludeDto {

	publisherList?: boolean;
	taxonomyList?: boolean;

}

export class GetGameQueryData extends GetOneQueryData {

	@Type(() => GetGameFilterByDto)
	declare filterBy?: GetGameFilterByDto;

	@Type(() => GetGameIncludeDto)
	declare include?: GetGameIncludeDto;

}

export class GetGameQueryResult extends StaticFactory {

	game?: Game;
	gameVersionList: GameVersion[] = [];
	gameProductList: GameProduct[] = [];

}

@Injectable()
export class GetGameQuery {

	constructor(
		@InjectRepository(Game)
		private readonly gameRepository: EntityRepository<Game>,
		@InjectRepository(GameVersion)
		private readonly gameVersionRepository: EntityRepository<GameVersion>,
		@InjectRepository(GameProduct)
		private readonly gameProductRepository: EntityRepository<GameProduct>,
	) {}

	async execute(data: GetGameQueryData): Promise<GetGameQueryResult> {
		const queryBuilder = this.gameRepository.createQueryBuilder('game');
		const gameId = data.filterBy?.id;
		const gameSlug = data.filterBy?.slug;

		if (!gameId && !gameSlug) {
			return { game: undefined, gameProductList: [], gameVersionList: [] };
		}

		if (data.include?.taxonomyList) {
			queryBuilder
				.leftJoinAndSelect('game.taxonomyList', 'taxonomy')
				.leftJoinAndSelect('taxonomy.taxonomyTerm', 'taxonomyTerm');
		}

		if (data.include?.publisherList) {
			queryBuilder.leftJoinAndSelect('game.publisherList', 'publisher');
		}

		queryBuilder.andWhere({ publishedAt: { $lte: new Date() } });

		if (gameId) {
			queryBuilder.andWhere({ id: gameId });
		}

		if (gameSlug) {
			queryBuilder.andWhere({ slug: gameSlug });
		}

		const game = await queryBuilder.getSingleResult();

		if (!game){
			return GetGameQueryResult.create({});
		}

		const gameVersionList = await this.gameVersionRepository.find(
			{ game, publishedAt: { $lte: new Date() } },
			{ orderBy: { publishedAt: 'desc' } },
		);
		const gameProductList = await this.gameProductRepository.find(
			{ gameVariant: { gameVersion: { $in: gameVersionList } }, isAvailable: true },
			{ populate: ['gameVariant'] },
		);

		return GetGameQueryResult.create({ game: game ?? undefined, gameVersionList, gameProductList });
	}

}