import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { addPagination } from '../../../../../lib/database/mikro.orm.query';
import type { PaginationDto } from '../../../../../lib/entity/query/query.dto';
import {
	ASCII_CHARACTER_LIST,
	DIACRITIC_CHARACTER_LIST,
	normalizeCatalogSearchQuery,
} from '../../catalog/query/catalog.search';
import { TaxonomyTerm, TaxonomyType } from '../../taxonomy/model/taxonomy.term.entity';

export interface GetAdminTaxonomyTermListQueryData {
	filterBy?: { q?: string; type?: TaxonomyType };
	pagination?: PaginationDto;
}

@Injectable()
export class GetAdminTaxonomyTermListQuery {

	constructor(
		@InjectRepository(TaxonomyTerm)
		private readonly taxonomyTermRepository: EntityRepository<TaxonomyTerm>,
	) {}

	async execute(data: GetAdminTaxonomyTermListQueryData): Promise<{ taxonomyTermList: TaxonomyTerm[]; totalItemCount: number }> {
		const queryBuilder = this.taxonomyTermRepository.createQueryBuilder('taxonomyTerm');
		const searchQuery = data.filterBy?.q?.trim();

		if (data.filterBy?.type) {
			queryBuilder.andWhere({ type: data.filterBy.type });
		}

		if (searchQuery) {
			const searchPattern = `%${normalizeCatalogSearchQuery(searchQuery)}%`;
			const searchFields = ['"taxonomyTerm"."label"', '"taxonomyTerm"."slug"'];
			const predicates = searchFields.map((field) =>
				`translate(lower(${field}), '${DIACRITIC_CHARACTER_LIST}', '${ASCII_CHARACTER_LIST}') like ?`,
			);
			queryBuilder.andWhere(`(${predicates.join(' or ')})`, searchFields.map(() => searchPattern));
		}

		addPagination(queryBuilder, data.pagination);
		queryBuilder.orderBy({ 'taxonomyTerm.type': 'ASC', 'taxonomyTerm.label': 'ASC' });

		const [taxonomyTermList, totalItemCount] = await queryBuilder.getResultAndCount();
		return { taxonomyTermList, totalItemCount };
	}

}