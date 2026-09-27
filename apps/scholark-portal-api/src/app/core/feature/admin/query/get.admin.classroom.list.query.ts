import { raw } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { addOrderBy, addPagination } from '../../../../../lib/database/mikro.orm.query';
import type { PaginationDto } from '../../../../../lib/entity/query/query.dto';
import {
	ASCII_CHARACTER_LIST,
	DIACRITIC_CHARACTER_LIST,
	normalizeCatalogSearchQuery
} from '../../catalog/query/catalog.search';
import { Classroom } from '../../education/model/classroom.entity';
import { EducationCatalogStatus } from '../../education/model/education.catalog.status';

export interface GetAdminClassroomListQueryData {
	filterBy?: {
		institutionId?: string;
		q?: string;
		status?: EducationCatalogStatus;
	};
	pagination?: PaginationDto;
}

@Injectable()
export class GetAdminClassroomListQuery {

	constructor(
		@InjectRepository(Classroom)
		private readonly classroomRepository: EntityRepository<Classroom>,
	) {}

	async execute(data: GetAdminClassroomListQueryData): Promise<{ classroomList: Classroom[]; totalItemCount: number }> {
		const queryBuilder = this.classroomRepository.createQueryBuilder('classroom')
			.leftJoinAndSelect('classroom.institution', 'institution');

		if (data.filterBy?.institutionId) {
			queryBuilder.andWhere({ institution: data.filterBy.institutionId });
		}

		if (data.filterBy?.status) {
			queryBuilder.andWhere({ status: data.filterBy.status });
		}

		const searchQuery = data.filterBy?.q?.trim();
		if (searchQuery) {
			const searchPattern = `%${normalizeCatalogSearchQuery(searchQuery)}%`;
			queryBuilder.andWhere({
				$or: ['name', 'code', 'slug'].map((property) => ({
					[raw((alias) => `translate(lower(${alias}.${property}), '${DIACRITIC_CHARACTER_LIST}', '${ASCII_CHARACTER_LIST}')`)]: {
						$like: searchPattern,
					},
				})),
			});
		}

		addPagination(queryBuilder, data.pagination);
		addOrderBy(queryBuilder, undefined, 'classroom.name', 'ASC');

		const [classroomList, totalItemCount] = await queryBuilder.getResultAndCount();
		return { classroomList, totalItemCount };
	}

}