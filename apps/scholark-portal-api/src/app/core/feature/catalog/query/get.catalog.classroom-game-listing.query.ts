import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Type } from 'class-transformer';

import { addOrderBy, addPagination } from '../../../../../lib/database/mikro.orm.query';
import { GetListQueryData, GetListQueryResult } from '../../../../../lib/entity/query/get.list.query';
import { GetOneQueryData } from '../../../../../lib/entity/query/get.one.query';
import { GetListFilterByDto } from '../../../../../lib/entity/query/query.dto';
import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { ClassroomGameListing } from '../../education/model/classroom.game.listing.entity';
import { normalizeCatalogSearchQuery } from './catalog.search';

export class GetCatalogClassroomGameListingListFilterByDto extends GetListFilterByDto {

	institutionId?: string;
	classroomId?: string;
	gameId?: string;
	taxonomyTermId?: string;

}

export class GetCatalogClassroomGameListingListQueryData extends GetListQueryData {

	@Type(() => GetCatalogClassroomGameListingListFilterByDto)
	declare filterBy?: GetCatalogClassroomGameListingListFilterByDto;

}

export class GetCatalogClassroomGameListingListQueryResult extends GetListQueryResult {

	classroomGameListingList!: ClassroomGameListing[];

}

export class GetCatalogClassroomGameListingQueryData extends GetOneQueryData {}

export class GetCatalogClassroomGameListingQueryResult extends StaticFactory {

	classroomGameListing?: ClassroomGameListing;

}

function addClassroomGameListingRelations(
	queryBuilder: ReturnType<EntityRepository<ClassroomGameListing>['createQueryBuilder']>,
): void {
	queryBuilder
		.leftJoinAndSelect('classroomGameListing.classroom', 'classroom')
		.leftJoinAndSelect('classroom.institution', 'institution')
		.leftJoinAndSelect('classroomGameListing.gameVersion', 'gameVersion')
		.leftJoinAndSelect('gameVersion.game', 'game')
		.leftJoinAndSelect('game.publisher', 'publisher')
		.leftJoinAndSelect('game.taxonomyList', 'gameTaxonomy')
		.leftJoinAndSelect('gameTaxonomy.taxonomyTerm', 'taxonomyTerm');
}

@Injectable()
export class GetCatalogClassroomGameListingListQuery {

	constructor(
		@InjectRepository(ClassroomGameListing)
		private readonly classroomGameListingRepository: EntityRepository<ClassroomGameListing>,
	) {}

	async execute(data: GetCatalogClassroomGameListingListQueryData): Promise<GetCatalogClassroomGameListingListQueryResult> {
		const queryBuilder = this.classroomGameListingRepository.createQueryBuilder('classroomGameListing');

		addClassroomGameListingRelations(queryBuilder);

		const currentDate = new Date();
		queryBuilder.distinct().andWhere({
			endAt: { $gt: currentDate },
			gameVersion: { publishedAt: { $lte: currentDate }, game: { publishedAt: { $lte: currentDate } } },
			publishedAt: { $lte: currentDate },
			startAt: { $lte: currentDate },
		});

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
			queryBuilder.andWhere('(lower(game.title) like ? or lower(game.slug) like ?)', [searchPattern, searchPattern]);
		}

		addPagination(queryBuilder, data.pagination);
		addOrderBy(queryBuilder, data.orderBy, 'game.title', 'ASC');

		const [classroomGameListingList, totalItemCount] = await queryBuilder.getResultAndCount();

		return { classroomGameListingList, totalItemCount };
	}

}

@Injectable()
export class GetCatalogClassroomGameListingQuery {

	constructor(
		@InjectRepository(ClassroomGameListing)
		private readonly classroomGameListingRepository: EntityRepository<ClassroomGameListing>,
	) {}

	async execute(data: GetCatalogClassroomGameListingQueryData): Promise<GetCatalogClassroomGameListingQueryResult> {
		if (!data.filterBy?.id) {
			return { classroomGameListing: undefined };
		}

		const queryBuilder = this.classroomGameListingRepository.createQueryBuilder('classroomGameListing');

		addClassroomGameListingRelations(queryBuilder);
		
		const currentDate = new Date();
		queryBuilder.where({
			endAt: { $gt: currentDate },
			gameVersion: { publishedAt: { $lte: currentDate }, game: { publishedAt: { $lte: currentDate } } },
			id: data.filterBy.id,
			publishedAt: { $lte: currentDate },
			startAt: { $lte: currentDate },
		});

		const classroomGameListing = await queryBuilder.getSingleResult();
		return { classroomGameListing: classroomGameListing ?? undefined };
	}

}