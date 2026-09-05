import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { addOrderBy } from '../../../../../lib/database/mikro.orm.query';
import { OrderByDto } from '../../../../../lib/entity/query/query.dto';
import { Game } from '../model/game.entity';

export interface GetGameListQueryData {
	filterBy?: {
		onlyFeatured?: boolean;
		onlyPublished?: boolean;
		q?: string;
	};
	include?: {
		taxonomyList?: boolean;
	};
	orderBy?: OrderByDto;
}

export interface GetGameListQueryResult {
	gameList: Game[];
	totalItemCount: number;
}

@Injectable()
export class GetGameListQuery {

	constructor(
		@InjectRepository(Game)
		private readonly gameRepository: EntityRepository<Game>,
	) {}

	async execute({
		filterBy = {},
		include,
		orderBy,
	}: GetGameListQueryData): Promise<GetGameListQueryResult> {
		const queryBuilder = this.gameRepository
			.createQueryBuilder('game')
			.select('*');

		if (include?.taxonomyList) {
			queryBuilder
				.leftJoinAndSelect('game.taxonomyList', 'taxonomy')
				.leftJoinAndSelect('taxonomy.taxonomyTerm', 'taxonomyTerm');
		}

		if (filterBy.onlyPublished) {
			queryBuilder.andWhere({ publishedAt: { $lte: new Date() } });
		}

		if (filterBy.onlyFeatured) {
			queryBuilder.andWhere({ isFeatured: true });
		}

		const searchQuery = filterBy.q?.trim();

		if (searchQuery) {
			queryBuilder.andWhere({ title: { $fulltext: searchQuery } });
		}

		addOrderBy(queryBuilder, orderBy);

		const [gameList, totalItemCount] = await queryBuilder.getResultAndCount();

		return { gameList, totalItemCount };
	}

}