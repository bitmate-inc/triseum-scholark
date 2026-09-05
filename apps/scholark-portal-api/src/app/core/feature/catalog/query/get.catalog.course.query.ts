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
import { Course } from '../../education/model/course.entity';
import { EducationCatalogStatus } from '../../education/model/education.catalog.status';
import {
	ASCII_CHARACTER_LIST,
	DIACRITIC_CHARACTER_LIST,
	normalizeCatalogSearchQuery,
} from './catalog.search';

export class GetCatalogCourseListFilterByDto extends GetListFilterByDto {

	institutionId?: string;
	status?: EducationCatalogStatus;

}

export class GetCatalogCourseListQueryData extends GetListQueryData {

	@Type(() => GetCatalogCourseListFilterByDto)
	declare filterBy?: GetCatalogCourseListFilterByDto;

}

export class GetCatalogCourseListQueryResult extends GetListQueryResult {

	courseList!: Course[];

}

export class GetCatalogCourseFilterByDto extends GetOneFilterByDto {

	slug?: string;

}

export class GetCatalogCourseQueryData extends GetOneQueryData {

	@Type(() => GetCatalogCourseFilterByDto)
	declare filterBy?: GetCatalogCourseFilterByDto;

}

export class GetCatalogCourseQueryResult extends StaticFactory {

	course?: Course;

}

@Injectable()
export class GetCatalogCourseListQuery {

	constructor(
		@InjectRepository(Course)
		private readonly courseRepository: EntityRepository<Course>,
	) {}

	async execute(data: GetCatalogCourseListQueryData): Promise<GetCatalogCourseListQueryResult> {
		const queryBuilder = this.courseRepository.createQueryBuilder('course')
			.leftJoinAndSelect('course.institution', 'institution');

		if (data.filterBy?.id) {
			queryBuilder.andWhere({ id: { $in: data.filterBy.id } });
		}

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
		addOrderBy(queryBuilder, data.orderBy, 'course.name', 'ASC');

		const [courseList, totalItemCount] = await queryBuilder.getResultAndCount();
		return { courseList, totalItemCount };
	}

}

@Injectable()
export class GetCatalogCourseQuery {

	constructor(
		@InjectRepository(Course)
		private readonly courseRepository: EntityRepository<Course>,
	) {}

	async execute(data: GetCatalogCourseQueryData): Promise<GetCatalogCourseQueryResult> {
		if (!data.filterBy?.id && !data.filterBy?.slug) {
			return { course: undefined };
		}

		const course = await this.courseRepository.createQueryBuilder('course')
			.leftJoinAndSelect('course.institution', 'institution')
			.where({
				...(data.filterBy.id ? { id: data.filterBy.id } : {}),
				...(data.filterBy.slug ? { slug: data.filterBy.slug } : {}),
			})
			.getSingleResult();

		return { course: course ?? undefined };
	}

}