import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Type } from 'class-transformer';

import { addOrderBy, addPagination } from '../../../../../lib/database/mikro.orm.query';
import { GetListQueryData, GetListQueryResult } from '../../../../../lib/entity/query/get.list.query';
import { IncludeDto } from '../../../../../lib/entity/query/query.dto';
import { Game } from '../../game/model/game.entity';

export class GetFeaturedGameListIncludeDto extends IncludeDto {

	publisher?: boolean;
	taxonomyList?: boolean;

}

export class GetFeaturedGameListQueryData extends GetListQueryData {

	@Type(() => GetFeaturedGameListIncludeDto)
	declare include?: GetFeaturedGameListIncludeDto;

}

export class GetFeaturedGameListQueryResult extends GetListQueryResult {

	gameList!: Game[];

}

@Injectable()
export class GetFeaturedGameListQuery {

	constructor(
		@InjectRepository(Game)
		private readonly gameRepository: EntityRepository<Game>,
	) {}

	async execute(
		data: GetFeaturedGameListQueryData,
	): Promise<GetFeaturedGameListQueryResult> {
		const queryBuilder = this.gameRepository.createQueryBuilder('game');

		if (data.include?.taxonomyList) {
			queryBuilder
				.leftJoinAndSelect('game.taxonomyList', 'taxonomy')
				.leftJoinAndSelect('taxonomy.taxonomyTerm', 'taxonomyTerm');
		}

		if (data.include?.publisher) {
			queryBuilder.leftJoinAndSelect('game.publisher', 'publisher');
		}

		queryBuilder.andWhere({
			isFeatured: true,
			publishedAt: { $lte: new Date() },
		});

		addPagination(queryBuilder, data.pagination);
		addOrderBy(queryBuilder, data.orderBy, 'game.title', 'ASC');

		const [gameList, totalItemCount] = await queryBuilder.getResultAndCount();

		return { gameList, totalItemCount };
	}

}