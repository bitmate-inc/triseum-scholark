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
import { ClassroomGame } from '../../education/model/classroom.game.entity';

export interface GetAdminClassroomGameListQueryData {
	filterBy?: {
		classroomId?: string;
		gameId?: string;
		institutionId?: string;
		q?: string;
	};
	pagination?: PaginationDto;
}

export interface GetAdminClassroomGameQueryData {
	filterBy?: { id?: string };
}

function addClassroomGameRelations(
	queryBuilder: ReturnType<EntityRepository<ClassroomGame>['createQueryBuilder']>,
): void {
	queryBuilder
		.leftJoinAndSelect('classroomGame.classroom', 'classroom')
		.leftJoinAndSelect('classroom.institution', 'institution')
		.leftJoinAndSelect('classroomGame.institutionGameOffer', 'institutionGameOffer')
		.leftJoinAndSelect('institutionGameOffer.gameVariant', 'gameVariant')
		.leftJoinAndSelect('gameVariant.gameVersion', 'gameVersion')
		.leftJoinAndSelect('gameVersion.game', 'game')
		.leftJoinAndSelect('game.publisher', 'publisher');
}

@Injectable()
export class GetAdminClassroomGameListQuery {

	constructor(
		@InjectRepository(ClassroomGame)
		private readonly classroomGameRepository: EntityRepository<ClassroomGame>,
	) {}

	async execute(data: GetAdminClassroomGameListQueryData): Promise<{ classroomGameList: ClassroomGame[]; totalItemCount: number }> {
		const queryBuilder = this.classroomGameRepository.createQueryBuilder('classroomGame');
		addClassroomGameRelations(queryBuilder);

		if (data.filterBy?.institutionId) {
			queryBuilder.andWhere({ classroom: { institution: data.filterBy.institutionId } });
		}
		if (data.filterBy?.classroomId) {
			queryBuilder.andWhere({ classroom: data.filterBy.classroomId });
		}
		if (data.filterBy?.gameId) {
			queryBuilder.andWhere({ institutionGameOffer: { gameVariant: { gameVersion: { game: data.filterBy.gameId } } } });
		}

		const searchQuery = data.filterBy?.q?.trim();
		if (searchQuery) {
			const searchPattern = `%${normalizeCatalogSearchQuery(searchQuery)}%`;
			const searchFields = ['classroom.name', 'classroom.code', 'classroom.slug', 'game.title', 'game.slug'];
			const predicates = searchFields.map((field) =>
				`translate(lower(${field}), '${DIACRITIC_CHARACTER_LIST}', '${ASCII_CHARACTER_LIST}') like ?`,
			);
			queryBuilder.andWhere(`(${predicates.join(' or ')})`, searchFields.map(() => searchPattern));
		}

		addPagination(queryBuilder, data.pagination);
		addOrderBy(queryBuilder, undefined, 'classroomGame.startAt', 'DESC');

		const [classroomGameList, totalItemCount] = await queryBuilder.getResultAndCount();
		return { classroomGameList, totalItemCount };
	}

}

@Injectable()
export class GetAdminClassroomGameQuery {

	constructor(
		@InjectRepository(ClassroomGame)
		private readonly classroomGameRepository: EntityRepository<ClassroomGame>,
	) {}

	async execute(data: GetAdminClassroomGameQueryData): Promise<{ classroomGame?: ClassroomGame }> {
		if (!data.filterBy?.id) {
			return { classroomGame: undefined };
		}

		const queryBuilder = this.classroomGameRepository.createQueryBuilder('classroomGame');
		addClassroomGameRelations(queryBuilder);
		queryBuilder.where({ id: data.filterBy.id });

		return { classroomGame: (await queryBuilder.getSingleResult()) ?? undefined };
	}

}