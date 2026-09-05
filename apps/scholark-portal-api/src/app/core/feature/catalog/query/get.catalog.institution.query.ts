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
import { EducationCatalogStatus } from '../../education/model/education.catalog.status';
import { EducationalInstitution } from '../../education/model/educational.institution.entity';
import {
	ASCII_CHARACTER_LIST,
	DIACRITIC_CHARACTER_LIST,
	normalizeCatalogSearchQuery,
} from './catalog.search';

export class GetCatalogInstitutionListFilterByDto extends GetListFilterByDto {

	status?: EducationCatalogStatus;

}

export class GetCatalogInstitutionListQueryData extends GetListQueryData {

	@Type(() => GetCatalogInstitutionListFilterByDto)
	declare filterBy?: GetCatalogInstitutionListFilterByDto;

}

export class GetCatalogInstitutionListQueryResult extends GetListQueryResult {

	institutionList!: EducationalInstitution[];

}

export class GetCatalogInstitutionFilterByDto extends GetOneFilterByDto {

	slug?: string;

}

export class GetCatalogInstitutionQueryData extends GetOneQueryData {

	@Type(() => GetCatalogInstitutionFilterByDto)
	declare filterBy?: GetCatalogInstitutionFilterByDto;

}

export class GetCatalogInstitutionQueryResult extends StaticFactory {

	institution?: EducationalInstitution;

}

@Injectable()
export class GetCatalogInstitutionListQuery {

	constructor(
		@InjectRepository(EducationalInstitution)
		private readonly institutionRepository: EntityRepository<EducationalInstitution>,
	) {}

	async execute(data: GetCatalogInstitutionListQueryData): Promise<GetCatalogInstitutionListQueryResult> {
		const queryBuilder = this.institutionRepository.createQueryBuilder('institution');

		if (data.filterBy?.id) {
			queryBuilder.andWhere({ id: { $in: data.filterBy.id } });
		}

		if (data.filterBy?.status) {
			queryBuilder.andWhere({ status: data.filterBy.status });
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
		addOrderBy(queryBuilder, data.orderBy, 'institution.name', 'ASC');

		const [institutionList, totalItemCount] = await queryBuilder.getResultAndCount();
		return { institutionList, totalItemCount };
	}

}

@Injectable()
export class GetCatalogInstitutionQuery {

	constructor(
		@InjectRepository(EducationalInstitution)
		private readonly institutionRepository: EntityRepository<EducationalInstitution>,
	) {}

	async execute(data: GetCatalogInstitutionQueryData): Promise<GetCatalogInstitutionQueryResult> {
		if (!data.filterBy?.id && !data.filterBy?.slug) {
			return { institution: undefined };
		}

		const institution = await this.institutionRepository.findOne({
			...(data.filterBy.id ? { id: data.filterBy.id } : {}),
			...(data.filterBy.slug ? { slug: data.filterBy.slug } : {}),
		});

		return { institution: institution ?? undefined };
	}

}