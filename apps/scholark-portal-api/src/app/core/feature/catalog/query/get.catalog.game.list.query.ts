import { raw } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Type } from 'class-transformer';

import { addOrderBy, addPagination } from '../../../../../lib/database/mikro.orm.query';
import { GetListQueryData, GetListQueryResult } from '../../../../../lib/entity/query/get.list.query';
import { GetListFilterByDto, IncludeDto } from '../../../../../lib/entity/query/query.dto';
import { Game } from '../../game/model/game.entity';
import {
	ASCII_CHARACTER_LIST,
	DIACRITIC_CHARACTER_LIST,
	normalizeCatalogSearchQuery
} from './catalog.search';

export class GetCatalogGameListFilterByDto extends GetListFilterByDto {

	declare q?: string;

}

export class GetCatalogGameListIncludeDto extends IncludeDto {

	publisherList?: boolean;
	taxonomyList?: boolean;

}

export class GetCatalogGameListQueryData extends GetListQueryData {

	@Type(() => GetCatalogGameListFilterByDto)
	declare filterBy?: GetCatalogGameListFilterByDto;

	@Type(() => GetCatalogGameListIncludeDto)
	declare include?: GetCatalogGameListIncludeDto;

}

export class GetCatalogGameListQueryResult extends GetListQueryResult {

	gameList!: Game[];

}

@Injectable()
export class GetCatalogGameListQuery {

	constructor(
		@InjectRepository(Game)
		private readonly gameRepository: EntityRepository<Game>,
	) {}

	async execute(
		data: GetCatalogGameListQueryData,
	): Promise<GetCatalogGameListQueryResult> {
		const queryBuilder = this.gameRepository.createQueryBuilder('game');

		if (data.include?.taxonomyList) {
			queryBuilder
				.leftJoinAndSelect('game.taxonomyList', 'taxonomy')
				.leftJoinAndSelect('taxonomy.taxonomyTerm', 'taxonomyTerm');
		}

		if (data.include?.publisherList) {
			queryBuilder.leftJoinAndSelect('game.publisherList', 'publisher');
		}

		queryBuilder.andWhere({ publishedAt: { $lte: new Date() } });
		
		if (data.filterBy?.id) {
			queryBuilder.andWhere({ id: { $in: data.filterBy.id } });
		}

		const searchQuery = data.filterBy?.q?.trim();

		if (searchQuery) {
			queryBuilder.andWhere({
				[raw((alias) => `translate(lower(${alias}.title), '${DIACRITIC_CHARACTER_LIST}', '${ASCII_CHARACTER_LIST}')`)]: {
					$like: `%${normalizeCatalogSearchQuery(searchQuery)}%`,
				},
			});
		}

		addPagination(queryBuilder, data.pagination);
		addOrderBy(queryBuilder, data.orderBy, 'game.title', 'ASC');

		const [gameList, totalItemCount] = await queryBuilder.getResultAndCount();

		return { gameList, totalItemCount };
	}

}