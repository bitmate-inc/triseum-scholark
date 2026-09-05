import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Type } from 'class-transformer';

import { GetOneQueryData } from '../../../../../lib/entity/query/get.one.query';
import { GetOneFilterByDto, IncludeDto } from '../../../../../lib/entity/query/query.dto';
import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { Game } from '../../game/model/game.entity';

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

}

@Injectable()
export class GetGameQuery {

	constructor(
		@InjectRepository(Game)
		private readonly gameRepository: EntityRepository<Game>,
	) {}

	async execute(data: GetGameQueryData): Promise<GetGameQueryResult> {
		const queryBuilder = this.gameRepository.createQueryBuilder('game');
		const gameId = data.filterBy?.id;
		const gameSlug = data.filterBy?.slug;

		if (!gameId && !gameSlug) {
			return { game: undefined };
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
		return { game: game ?? undefined };
	}

}