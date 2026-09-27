import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { addOrderBy, addPagination } from '../../../../../lib/database/mikro.orm.query';
import type { PaginationDto } from '../../../../../lib/entity/query/query.dto';
import { InstitutionGameOffer } from '../../education/model/institution.game.offer.entity';
import { PublicGameOffer } from '../../game/model/public.game.offer.entity';

export type AdminGameOfferType = 'public' | 'institution';

export interface GetAdminGameOfferListQueryData {
	filterBy?: { q?: string; type: AdminGameOfferType };
	pagination?: PaginationDto;
}

@Injectable()
export class GetAdminGameOfferListQuery {

	constructor(
		@InjectRepository(PublicGameOffer)
		private readonly publicGameOfferRepository: EntityRepository<PublicGameOffer>,
		@InjectRepository(InstitutionGameOffer)
		private readonly institutionGameOfferRepository: EntityRepository<InstitutionGameOffer>,
	) {}

	async execute(data: GetAdminGameOfferListQueryData): Promise<{
		offerList: (PublicGameOffer | InstitutionGameOffer)[];
		totalItemCount: number;
	}> {
		const offerType = data.filterBy?.type ?? 'public';
		const searchQuery = data.filterBy?.q?.trim();
		if (offerType === 'public') {
			const queryBuilder = this.publicGameOfferRepository.createQueryBuilder('offer')
				.leftJoinAndSelect('offer.gameVariant', 'gameVariant')
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
			addOrderBy(queryBuilder, undefined, 'offer.createdAt', 'DESC');
			const [offerList, totalItemCount] = await queryBuilder.getResultAndCount();
			return { offerList, totalItemCount };
		}

		const queryBuilder = this.institutionGameOfferRepository.createQueryBuilder('offer')
			.leftJoinAndSelect('offer.gameVariant', 'gameVariant')
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
		addOrderBy(queryBuilder, undefined, 'game.title', 'ASC');
		const [offerList, totalItemCount] = await queryBuilder.getResultAndCount();
		return { offerList, totalItemCount };
	}

}