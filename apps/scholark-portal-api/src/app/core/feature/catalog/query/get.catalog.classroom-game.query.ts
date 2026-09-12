import { raw } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Type } from 'class-transformer';

import { addOrderBy, addPagination } from '../../../../../lib/database/mikro.orm.query';
import { GetListQueryData, GetListQueryResult } from '../../../../../lib/entity/query/get.list.query';
import { GetOneQueryData } from '../../../../../lib/entity/query/get.one.query';
import { GetListFilterByDto } from '../../../../../lib/entity/query/query.dto';
import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { ClassroomGame } from '../../education/model/classroom.game.entity';
import { GameVersion } from '../../game/model/game.version.entity';
import {
	ASCII_CHARACTER_LIST,
	DIACRITIC_CHARACTER_LIST,
	loadGamePrice,
	normalizeCatalogSearchQuery,
} from './catalog.search';

export class GetCatalogClassroomGameListFilterByDto extends GetListFilterByDto {

	institutionId?: string;
	classroomId?: string;
	gameId?: string;
	taxonomyTermId?: string;

}

export class GetCatalogClassroomGameListQueryData extends GetListQueryData {

	@Type(() => GetCatalogClassroomGameListFilterByDto)
	declare filterBy?: GetCatalogClassroomGameListFilterByDto;

}

export class GetCatalogClassroomGameListQueryResult extends GetListQueryResult {

	classroomGameList!: ClassroomGame[];

}

export class GetCatalogClassroomGameQueryData extends GetOneQueryData {}

export class GetCatalogClassroomGameQueryResult extends StaticFactory {

	classroomGame?: ClassroomGame;

}

function addClassroomGameRelations(
	queryBuilder: ReturnType<EntityRepository<ClassroomGame>['createQueryBuilder']>,
): void {
	queryBuilder
		.leftJoinAndSelect('classroomGame.classroom', 'classroom')
		.leftJoinAndSelect('classroom.institution', 'institution')
		.leftJoinAndSelect('classroomGame.gameVersion', 'gameVersion')
		.leftJoinAndSelect('gameVersion.game', 'game')
		.leftJoinAndSelect('game.publisherList', 'publisher')
		.leftJoinAndSelect('game.taxonomyList', 'gameTaxonomy')
		.leftJoinAndSelect('gameTaxonomy.taxonomyTerm', 'taxonomyTerm');
}

@Injectable()
export class GetCatalogClassroomGameListQuery {

	constructor(
		@InjectRepository(ClassroomGame)
		private readonly classroomGameRepository: EntityRepository<ClassroomGame>,
		@InjectRepository(GameVersion)
		private readonly gameVersionRepository: EntityRepository<GameVersion>,
	) {}

	async execute(data: GetCatalogClassroomGameListQueryData): Promise<GetCatalogClassroomGameListQueryResult> {
		const queryBuilder = this.classroomGameRepository.createQueryBuilder('classroomGame');

		addClassroomGameRelations(queryBuilder);

		queryBuilder.distinct().andWhere({ gameVersion: { game: { publishedAt: { $lte: new Date() } } } });

		if (data.filterBy?.id) {
			queryBuilder.andWhere({ id: { $in: data.filterBy.id } });
		}

		if (data.filterBy?.institutionId) {
			queryBuilder.andWhere({ classroom: { institution: data.filterBy.institutionId } });
		}

		if (data.filterBy?.classroomId) {
			queryBuilder.andWhere({ classroom: data.filterBy.classroomId });
		}

		if (data.filterBy?.gameId) {
			queryBuilder.andWhere({ gameVersion: { game: data.filterBy.gameId } });
		}

		if (data.filterBy?.taxonomyTermId) {
			queryBuilder.andWhere({ gameVersion: { game: { taxonomyList: { taxonomyTerm: data.filterBy.taxonomyTermId } } } });
		}

		const searchQuery = data.filterBy?.q?.trim();

		if (searchQuery) {
			const searchPattern = `%${normalizeCatalogSearchQuery(searchQuery)}%`;
			queryBuilder.andWhere({
				$or: ['title', 'slug'].map((property) => ({
					gameVersion: {
						game: {
							[raw((alias) => `translate(lower(${alias}.${property}), '${DIACRITIC_CHARACTER_LIST}', '${ASCII_CHARACTER_LIST}')`)]: {
								$like: searchPattern,
							},
						},
					},
				})),
			});
		}

		addPagination(queryBuilder, data.pagination);
		addOrderBy(queryBuilder, data.orderBy, 'game.title', 'ASC');

		const [classroomGameList, totalItemCount] = await queryBuilder.getResultAndCount();

		const gameList = classroomGameList.map(i => i.gameVersion.game);
		await loadGamePrice(gameList, this.gameVersionRepository);

		return { classroomGameList, totalItemCount };
	}

}

@Injectable()
export class GetCatalogClassroomGameQuery {

	constructor(
		@InjectRepository(ClassroomGame)
		private readonly classroomGameRepository: EntityRepository<ClassroomGame>,
	) {}

	async execute(data: GetCatalogClassroomGameQueryData): Promise<GetCatalogClassroomGameQueryResult> {
		if (!data.filterBy?.id) {
			return { classroomGame: undefined };
		}

		const queryBuilder = this.classroomGameRepository.createQueryBuilder('classroomGame');

		addClassroomGameRelations(queryBuilder);
		
		queryBuilder.where({
			gameVersion: { game: { publishedAt: { $lte: new Date() } } },
			id: data.filterBy.id,
		});

		const classroomGame = await queryBuilder.getSingleResult();
		return { classroomGame: classroomGame ?? undefined };
	}

}