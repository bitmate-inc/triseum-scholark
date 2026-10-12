import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { addOrderBy, addPagination } from '../../../../../lib/database/mikro.orm.query';
import type { PaginationDto } from '../../../../../lib/entity/query/query.dto';
import { ClassroomGameListing } from '../../education/model/classroom.game.listing.entity';
import { PublicGameListing } from '../../game/model/public.game.listing.entity';

export type AdminGameListingType = 'public' | 'classroom';

export interface GetAdminGameListingListQueryData {
	filterBy?: { q?: string; type: AdminGameListingType };
	pagination?: PaginationDto;
}

@Injectable()
export class GetAdminGameListingListQuery {

	constructor(
		@InjectRepository(PublicGameListing)
		private readonly publicGameListingRepository: EntityRepository<PublicGameListing>,
		@InjectRepository(ClassroomGameListing)
		private readonly classroomGameListingRepository: EntityRepository<ClassroomGameListing>,
	) {}

	async execute(data: GetAdminGameListingListQueryData): Promise<{
		listingList: (PublicGameListing | ClassroomGameListing)[];
		totalItemCount: number;
	}> {
		const listingType = data.filterBy?.type ?? 'public';
		const searchQuery = data.filterBy?.q?.trim();
		if (listingType === 'public') {
			const queryBuilder = this.publicGameListingRepository.createQueryBuilder('listing')
				.leftJoinAndSelect('listing.gameVariant', 'gameVariant')
				.leftJoinAndSelect('gameVariant.gameVersion', 'gameVersion')
				.leftJoinAndSelect('gameVersion.game', 'game')
				.leftJoinAndSelect('game.publisher', 'publisher');

			if (searchQuery) {
				const searchPattern = `%${searchQuery}%`;
				queryBuilder.andWhere({
					$or: [
						{ gameVariant: { gameVersion: { game: { title: { $ilike: searchPattern } } } } },
						{ gameVariant: { gameVersion: { game: { slug: { $ilike: searchPattern } } } } },
						{
							gameVariant: {
								gameVersion: {
									game: { publisher: { name: { $ilike: searchPattern } } },
								},
							},
						},
						{
							gameVariant: {
								gameVersion: {
									game: { publisher: { slug: { $ilike: searchPattern } } },
								},
							},
						},
					],
				});
			}

			addPagination(queryBuilder, data.pagination);
			addOrderBy(queryBuilder, undefined, 'listing.createdAt', 'DESC');
			const [listingList, totalItemCount] = await queryBuilder.getResultAndCount();
			return { listingList, totalItemCount };
		}

		const queryBuilder = this.classroomGameListingRepository.createQueryBuilder('listing')
			.leftJoinAndSelect('listing.classroom', 'classroom')
			.leftJoinAndSelect('classroom.institution', 'institution')
			.leftJoinAndSelect('listing.gameVariant', 'gameVariant')
			.leftJoinAndSelect('gameVariant.gameVersion', 'gameVersion')
			.leftJoinAndSelect('gameVersion.game', 'game')
			.leftJoinAndSelect('game.publisher', 'publisher');

		if (searchQuery) {
			const searchPattern = `%${searchQuery}%`;
			queryBuilder.andWhere({
				$or: [
					{ gameVariant: { gameVersion: { game: { title: { $ilike: searchPattern } } } } },
					{ gameVariant: { gameVersion: { game: { slug: { $ilike: searchPattern } } } } },
					{ classroom: { name: { $ilike: searchPattern } } },
					{ classroom: { institution: { name: { $ilike: searchPattern } } } },
					{
						gameVariant: {
							gameVersion: {
								game: { publisher: { name: { $ilike: searchPattern } } },
							},
						},
					},
					{
						gameVariant: {
							gameVersion: {
								game: { publisher: { slug: { $ilike: searchPattern } } },
							},
						},
					},
				],
			});
		}

		addPagination(queryBuilder, data.pagination);
		addOrderBy(queryBuilder, undefined, 'game.title', 'ASC');
		const [listingList, totalItemCount] = await queryBuilder.getResultAndCount();
		return { listingList, totalItemCount };
	}

}