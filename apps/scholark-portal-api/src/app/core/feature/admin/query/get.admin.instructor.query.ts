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
import { Classroom } from '../../education/model/classroom.entity';
import { Institution } from '../../education/model/institution.entity';
import { Instructor } from '../../education/model/instructor.entity';

export interface GetAdminInstructorListQueryData {
	filterBy?: {
		institutionId?: string;
		q?: string;
	};
	pagination?: PaginationDto;
}

export interface GetAdminInstructorQueryData {
	filterBy?: { id?: string };
}

@Injectable()
export class GetAdminInstructorListQuery {

	constructor(
		@InjectRepository(Instructor)
		private readonly instructorRepository: EntityRepository<Instructor>,
		@InjectRepository(Institution)
		private readonly institutionRepository: EntityRepository<Institution>,
	) {}

	async execute(data: GetAdminInstructorListQueryData): Promise<{ instructorList: Instructor[]; totalItemCount: number }> {
		const queryBuilder = this.instructorRepository.createQueryBuilder('instructor');

		if (data.filterBy?.institutionId) {
			const institution = await this.institutionRepository.findOne(
				{ id: data.filterBy.institutionId },
				{ populate: ['instructorList'] },
			);
			const instructorIds = institution?.instructorList.getIdentifiers() ?? [];
			if (instructorIds.length === 0) {
				return { instructorList: [], totalItemCount: 0 };
			}
			queryBuilder.andWhere({ id: { $in: instructorIds } });
		}

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
		addOrderBy(queryBuilder, undefined, 'instructor.name', 'ASC');

		const [instructorList, totalItemCount] = await queryBuilder.getResultAndCount();
		return { instructorList, totalItemCount };
	}

}

@Injectable()
export class GetAdminInstructorQuery {

	constructor(
		@InjectRepository(Instructor)
		private readonly instructorRepository: EntityRepository<Instructor>,
		@InjectRepository(Institution)
		private readonly institutionRepository: EntityRepository<Institution>,
		@InjectRepository(Classroom)
		private readonly classroomRepository: EntityRepository<Classroom>,
	) {}

	async execute(data: GetAdminInstructorQueryData): Promise<{
		classroomList: Classroom[];
		instructor?: Instructor;
		institutionList: Institution[];
	}> {
		if (!data.filterBy?.id) {
			return { classroomList: [], institutionList: [] };
		}

		const instructor = await this.instructorRepository.findOne({ id: data.filterBy.id });
		if (!instructor) {
			return { classroomList: [], institutionList: [] };
		}

		const [institutionList, classroomList] = await Promise.all([
			this.institutionRepository.find({ instructorList: instructor.id! }),
			this.classroomRepository.find(
				{ instructorList: instructor.id! },
				{ populate: ['institution'], orderBy: { name: 'ASC' } },
			),
		]);

		return { classroomList, instructor, institutionList };
	}

}