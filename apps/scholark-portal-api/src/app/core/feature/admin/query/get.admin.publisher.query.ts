import { raw } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { addOrderBy, addPagination } from '../../../../../lib/database/mikro.orm.query';
import type { PaginationDto } from '../../../../../lib/entity/query/query.dto';
import {
	ASCII_CHARACTER_LIST,
	DIACRITIC_CHARACTER_LIST,
	normalizeCatalogSearchQuery,
} from '../../catalog/query/catalog.search';
import { Game } from '../../game/model/game.entity';
import { GameVersion } from '../../game/model/game.version.entity';
import { Publisher } from '../../publisher/model/publisher.entity';

export interface GetAdminPublisherListQueryData {
	filterBy?: { q?: string };
	pagination?: PaginationDto;
}

export interface GetAdminPublisherQueryData {
	filterBy?: { id?: string };
}

@Injectable()
export class GetAdminPublisherListQuery {

	constructor(
		@InjectRepository(Publisher)
		private readonly publisherRepository: EntityRepository<Publisher>,
	) {}

	async execute(data: GetAdminPublisherListQueryData): Promise<{ publisherList: Publisher[]; totalItemCount: number }> {
		const queryBuilder = this.publisherRepository.createQueryBuilder('publisher');
		const searchQuery = data.filterBy?.q?.trim();

		if (searchQuery) {
			const searchPattern = `%${normalizeCatalogSearchQuery(searchQuery)}%`;
			queryBuilder.andWhere({
				$or: ['name', 'slug'].map((property) => ({
					[raw((alias) => `translate(lower(${alias}.${property}), '${DIACRITIC_CHARACTER_LIST}', '${ASCII_CHARACTER_LIST}')`)]: {
						$like: searchPattern,
					},
				})),
			});
		}

		addPagination(queryBuilder, data.pagination);
		addOrderBy(queryBuilder, undefined, 'publisher.name', 'ASC');

		const [publisherList, totalItemCount] = await queryBuilder.getResultAndCount();
		return { publisherList, totalItemCount };
	}

}

@Injectable()
export class GetAdminPublisherQuery {

	constructor(
		@InjectRepository(Publisher)
		private readonly publisherRepository: EntityRepository<Publisher>,
		@InjectRepository(Game)
		private readonly gameRepository: EntityRepository<Game>,
		@InjectRepository(GameVersion)
		private readonly gameVersionRepository: EntityRepository<GameVersion>,
	) {}

	async execute(data: GetAdminPublisherQueryData): Promise<{
		gameList: Game[];
		gameVersionList: GameVersion[];
		publisher?: Publisher;
	}> {
		if (!data.filterBy?.id) {
			return { gameList: [], gameVersionList: [] };
		}

		const publisher = await this.publisherRepository.findOne({ id: data.filterBy.id });
		if (!publisher) {
			return { gameList: [], gameVersionList: [] };
		}

		const gameList = await this.gameRepository.find(
			{ publisher: publisher.id! },
			{ orderBy: { title: 'ASC' } },
		);
		const gameIds = gameList.map((game) => game.id!);
		const gameVersionList = gameIds.length === 0
			? []
			: await this.gameVersionRepository.find(
				{ game: { $in: gameIds } },
				{ orderBy: { publisherVersion: 'DESC' } },
			);

		return { gameList, gameVersionList, publisher };
	}

}