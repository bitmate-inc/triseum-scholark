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
import { GameVariant } from '../../game/model/game.variant.entity';
import { GameVersion } from '../../game/model/game.version.entity';
import { PublicGameListing } from '../../game/model/public.game.listing.entity';

export type AdminGamePublicationFilter = 'published' | 'unpublished' | 'scheduled';

export interface GetAdminGameListQueryData {
	filterBy?: {
		publication?: AdminGamePublicationFilter;
		publisherId?: string;
		q?: string;
	};
	pagination?: PaginationDto;
}

export interface GetAdminGameQueryData {
	filterBy?: { id?: string };
}

@Injectable()
export class GetAdminGameListQuery {

	constructor(
		@InjectRepository(Game)
		private readonly gameRepository: EntityRepository<Game>,
	) {}

	async execute(data: GetAdminGameListQueryData): Promise<{ gameList: Game[]; totalItemCount: number }> {
		const queryBuilder = this.gameRepository.createQueryBuilder('game')
			.leftJoinAndSelect('game.publisher', 'publisher');

		if (data.filterBy?.publisherId) {
			queryBuilder.andWhere({ publisher: data.filterBy.publisherId });
		}

		if (data.filterBy?.publication === 'unpublished') {
			queryBuilder.andWhere({ publishedAt: null });
		} else if (data.filterBy?.publication === 'scheduled') {
			queryBuilder.andWhere({ publishedAt: { $gt: new Date() } });
		} else if (data.filterBy?.publication === 'published') {
			queryBuilder.andWhere({ publishedAt: { $lte: new Date() } });
		}

		const searchQuery = data.filterBy?.q?.trim();
		if (searchQuery) {
			const searchPattern = `%${normalizeCatalogSearchQuery(searchQuery)}%`;
			queryBuilder.andWhere({
				$or: ['title', 'slug'].map((property) => ({
					[raw((alias) => `translate(lower(${alias}.${property}), '${DIACRITIC_CHARACTER_LIST}', '${ASCII_CHARACTER_LIST}')`)]: {
						$like: searchPattern,
					},
				})),
			});
		}

		addPagination(queryBuilder, data.pagination);
		addOrderBy(queryBuilder, undefined, 'game.title', 'ASC');

		const [gameList, totalItemCount] = await queryBuilder.getResultAndCount();
		return { gameList, totalItemCount };
	}

}

@Injectable()
export class GetAdminGameQuery {

	constructor(
		@InjectRepository(Game)
		private readonly gameRepository: EntityRepository<Game>,
		@InjectRepository(GameVersion)
		private readonly gameVersionRepository: EntityRepository<GameVersion>,
		@InjectRepository(GameVariant)
		private readonly gameVariantRepository: EntityRepository<GameVariant>,
		@InjectRepository(PublicGameListing)
		private readonly publicGameListingRepository: EntityRepository<PublicGameListing>,
	) {}

	async execute(data: GetAdminGameQueryData): Promise<{
		game?: Game;
		gameVersionList: GameVersion[];
		gameVariantList: GameVariant[];
		publicGameListingList: PublicGameListing[];
	}> {
		if (!data.filterBy?.id) {
			return { gameVersionList: [], gameVariantList: [], publicGameListingList: [] };
		}

		const game = await this.gameRepository.findOne(
			{ id: data.filterBy.id },
			{ populate: ['publisher'] },
		);
		if (!game) {
			return { gameVersionList: [], gameVariantList: [], publicGameListingList: [] };
		}

		const gameVersionList = await this.gameVersionRepository.find(
			{ game: game.id! },
			{ orderBy: { publisherVersion: 'DESC' } },
		);
		const gameVersionIds = gameVersionList.map((version) => version.id!);
		const gameVariantList = gameVersionIds.length === 0
			? []
			: await this.gameVariantRepository.find(
				{ gameVersion: { $in: gameVersionIds } },
				{ orderBy: { language: 'ASC', mode: 'ASC' } },
			);
		const gameVariantIds = gameVariantList.map((variant) => variant.id!);
		const publicGameListingList = gameVariantIds.length === 0
			? []
			: await this.publicGameListingRepository.find({ gameVariant: { $in: gameVariantIds } });

		return { game, gameVersionList, gameVariantList, publicGameListingList };
	}

}