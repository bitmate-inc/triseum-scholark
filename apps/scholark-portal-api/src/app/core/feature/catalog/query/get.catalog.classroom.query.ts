import { raw } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Type } from 'class-transformer';

import { addOrderBy, addPagination } from '../../../../../lib/database/mikro.orm.query';
import { GetListQueryData, GetListQueryResult } from '../../../../../lib/entity/query/get.list.query';
import { GetOneQueryData } from '../../../../../lib/entity/query/get.one.query';
import { GetListFilterByDto, GetOneFilterByDto } from '../../../../../lib/entity/query/query.dto';
import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { Classroom } from '../../education/model/classroom.entity';
import { EducationCatalogStatus } from '../../education/model/education.catalog.status';
import {
	ASCII_CHARACTER_LIST,
	DIACRITIC_CHARACTER_LIST,
	normalizeCatalogSearchQuery,
} from './catalog.search';

export class GetCatalogClassroomListFilterByDto extends GetListFilterByDto {

	institutionId?: string;
	courseId?: string;
	taxonomyTermId?: string;
	status?: EducationCatalogStatus;

}

export class GetCatalogClassroomListQueryData extends GetListQueryData {

	@Type(() => GetCatalogClassroomListFilterByDto)
	declare filterBy?: GetCatalogClassroomListFilterByDto;

}

export class GetCatalogClassroomListQueryResult extends GetListQueryResult {

	classroomList!: Classroom[];

}

export class GetCatalogClassroomFilterByDto extends GetOneFilterByDto {

	slug?: string;

}

export class GetCatalogClassroomQueryData extends GetOneQueryData {

	@Type(() => GetCatalogClassroomFilterByDto)
	declare filterBy?: GetCatalogClassroomFilterByDto;

}

export class GetCatalogClassroomQueryResult extends StaticFactory {

	classroom?: Classroom;

}

function addClassroomRelations(queryBuilder: ReturnType<EntityRepository<Classroom>['createQueryBuilder']>): void {
	queryBuilder
		.leftJoinAndSelect('classroom.institution', 'institution')
		.leftJoinAndSelect('classroom.courseList', 'course')
		.leftJoinAndSelect('classroom.taxonomyTermList', 'taxonomyTerm');
}

@Injectable()
export class GetCatalogClassroomListQuery {

	constructor(
		@InjectRepository(Classroom)
		private readonly classroomRepository: EntityRepository<Classroom>,
	) {}

	async execute(data: GetCatalogClassroomListQueryData): Promise<GetCatalogClassroomListQueryResult> {
		const queryBuilder = this.classroomRepository.createQueryBuilder('classroom');
		addClassroomRelations(queryBuilder);
		queryBuilder.distinct();

		if (data.filterBy?.id) {
			queryBuilder.andWhere({ id: { $in: data.filterBy.id } });
		}

		if (data.filterBy?.institutionId) {
			queryBuilder.andWhere({ institution: data.filterBy.institutionId });
		}

		if (data.filterBy?.courseId) {
			queryBuilder.andWhere({ courseList: data.filterBy.courseId });
		}

		if (data.filterBy?.taxonomyTermId) {
			queryBuilder.andWhere({ taxonomyTermList: data.filterBy.taxonomyTermId });
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
		addOrderBy(queryBuilder, data.orderBy, 'classroom.name', 'ASC');

		const [classroomList, totalItemCount] = await queryBuilder.getResultAndCount();
		return { classroomList, totalItemCount };
	}

}

@Injectable()
export class GetCatalogClassroomQuery {

	constructor(
		@InjectRepository(Classroom)
		private readonly classroomRepository: EntityRepository<Classroom>,
	) {}

	async execute(data: GetCatalogClassroomQueryData): Promise<GetCatalogClassroomQueryResult> {
		if (!data.filterBy?.id && !data.filterBy?.slug) {
			return { classroom: undefined };
		}

		const queryBuilder = this.classroomRepository.createQueryBuilder('classroom');
		addClassroomRelations(queryBuilder);
		queryBuilder.where({
			...(data.filterBy.id ? { id: data.filterBy.id } : {}),
			...(data.filterBy.slug ? { slug: data.filterBy.slug } : {}),
		});

		const classroom = await queryBuilder.getSingleResult();
		return { classroom: classroom ?? undefined };
	}

}