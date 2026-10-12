import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Type } from 'class-transformer';

import { GetOneQueryData } from '../../../../../lib/entity/query/get.one.query';
import { GetOneFilterByDto, IncludeDto } from '../../../../../lib/entity/query/query.dto';
import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { Game } from '../../game/model/game.entity';
import { GameVersion } from '../../game/model/game.version.entity';
import { PublicGameListing } from '../../game/model/public.game.listing.entity';

export class GetGameFilterByDto extends GetOneFilterByDto {

	declare id?: Game['id'];
	slug?: string;

}

export class GetGameIncludeDto extends IncludeDto {

	publisher?: boolean;
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
	publicListingList: PublicGameListing[] = [];

}

@Injectable()
export class GetGameQuery {

	constructor(
		@InjectRepository(Game)
		private readonly gameRepository: EntityRepository<Game>,
		@InjectRepository(GameVersion)
		private readonly gameVersionRepository: EntityRepository<GameVersion>,
		@InjectRepository(PublicGameListing)
		private readonly publicListingRepository: EntityRepository<PublicGameListing>,
	) {}

	async execute(data: GetGameQueryData): Promise<GetGameQueryResult> {
		const queryBuilder = this.gameRepository.createQueryBuilder('game');
		const gameId = data.filterBy?.id;
		const gameSlug = data.filterBy?.slug;

		if (!gameId && !gameSlug) {
			return GetGameQueryResult.create({});
		}

		if (data.include?.taxonomyList) {
			queryBuilder
				.leftJoinAndSelect('game.taxonomyList', 'taxonomy')
				.leftJoinAndSelect('taxonomy.taxonomyTerm', 'taxonomyTerm');
		}

		if (data.include?.publisher) {
			queryBuilder.leftJoinAndSelect('game.publisher', 'publisher');
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

		const publicListingList = await this.publicListingRepository.find(
			{
				gameVariant: { gameVersion: { $in: gameVersionList } },
				isAvailable: true,
				publishedAt: { $lte: new Date() },
			},
			{ populate: ['gameVariant'] },
		);

		return GetGameQueryResult.create({ 
			game, gameVersionList, publicListingList
		});
	}

}