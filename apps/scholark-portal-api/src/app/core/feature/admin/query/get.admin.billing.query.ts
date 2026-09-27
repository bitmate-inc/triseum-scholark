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
import { GameAcquisition, GameAcquisitionMechanism } from '../../game/model/game.acquisition.entity';
import { GameAcquisitionEvent } from '../../game/model/game.acquisition.event.entity';
import { GameLicense } from '../../game/model/game.license.entity';
import { GamePaymentAttempt, GamePaymentAttemptStatus } from '../../game/model/game.payment.attempt.entity';

export type AdminLicenseStatus = 'active' | 'expired' | 'scheduled';

export interface GetAdminAcquisitionListQueryData {
	filterBy?: { mechanism?: GameAcquisitionMechanism; q?: string };
	pagination?: PaginationDto;
}

export interface GetAdminPaymentAttemptListQueryData {
	filterBy?: { q?: string; status?: GamePaymentAttemptStatus };
	pagination?: PaginationDto;
}

export interface GetAdminLicenseListQueryData {
	filterBy?: { q?: string; status?: AdminLicenseStatus };
	pagination?: PaginationDto;
}

@Injectable()
export class GetAdminAcquisitionListQuery {

	constructor(
		@InjectRepository(GameAcquisition)
		private readonly acquisitionRepository: EntityRepository<GameAcquisition>,
	) {}

	async execute(data: GetAdminAcquisitionListQueryData): Promise<{ acquisitionList: GameAcquisition[]; totalItemCount: number }> {
		const queryBuilder = this.acquisitionRepository.createQueryBuilder('acquisition');
		queryBuilder
			.leftJoinAndSelect('acquisition.user', 'user')
			.leftJoinAndSelect('acquisition.license', 'license')
			.leftJoinAndSelect('license.gameVariant', 'gameVariant')
			.leftJoinAndSelect('gameVariant.gameVersion', 'gameVersion')
			.leftJoinAndSelect('gameVersion.game', 'game');

		if (data.filterBy?.mechanism) {
			queryBuilder.andWhere({ mechanism: data.filterBy.mechanism });
		}

		const searchQuery = data.filterBy?.q?.trim();
		if (searchQuery) {
			const searchPattern = `%${normalizeCatalogSearchQuery(searchQuery)}%`;
			const searchFields = ['"user"."email"', '"user"."first_name"', '"user"."last_name"', '"game"."title"'];
			const predicates = searchFields.map((field) =>
				`translate(lower(${field}), '${DIACRITIC_CHARACTER_LIST}', '${ASCII_CHARACTER_LIST}') like ?`,
			);
			queryBuilder.andWhere(`(${predicates.join(' or ')})`, searchFields.map(() => searchPattern));
		}

		addPagination(queryBuilder, data.pagination);
		addOrderBy(queryBuilder, undefined, 'acquisition.createdAt', 'DESC');

		const [acquisitionList, totalItemCount] = await queryBuilder.getResultAndCount();
		return { acquisitionList, totalItemCount };
	}

	async executeOne(id: string): Promise<{ acquisition?: GameAcquisition; eventList: GameAcquisitionEvent[] }> {
		const entityManager = this.acquisitionRepository.getEntityManager();
		const acquisition = await entityManager.findOne(GameAcquisition, { id }, {
			populate: [
				'user',
				'license.gameVariant.gameVersion.game',
				'license.classroomGame.classroom.institution',
				'paymentAttempt',
				'codeRedemption.acquisitionCode',
			] as never,
		});
		if (!acquisition) {
			return { eventList: [] };
		}

		const eventList = await entityManager.find(
			GameAcquisitionEvent,
			{ acquisition: id },
			{ orderBy: { createdAt: 'ASC', id: 'ASC' }, populate: ['actorUser'] },
		);
		return { acquisition, eventList };
	}

}

@Injectable()
export class GetAdminPaymentAttemptListQuery {

	constructor(
		@InjectRepository(GamePaymentAttempt)
		private readonly paymentAttemptRepository: EntityRepository<GamePaymentAttempt>,
	) {}

	async execute(data: GetAdminPaymentAttemptListQueryData): Promise<{ paymentAttemptList: GamePaymentAttempt[]; totalItemCount: number }> {
		const queryBuilder = this.paymentAttemptRepository.createQueryBuilder('paymentAttempt');
		queryBuilder
			.leftJoinAndSelect('paymentAttempt.user', 'user')
			.leftJoinAndSelect('paymentAttempt.publicOffer', 'publicOffer')
			.leftJoinAndSelect('publicOffer.gameVariant', 'publicGameVariant')
			.leftJoinAndSelect('publicGameVariant.gameVersion', 'publicGameVersion')
			.leftJoinAndSelect('publicGameVersion.game', 'publicGame')
			.leftJoinAndSelect('paymentAttempt.institutionGameOffer', 'institutionGameOffer')
			.leftJoinAndSelect('institutionGameOffer.gameVariant', 'institutionGameVariant')
			.leftJoinAndSelect('institutionGameVariant.gameVersion', 'institutionGameVersion')
			.leftJoinAndSelect('institutionGameVersion.game', 'institutionGame')
			.leftJoinAndSelect('paymentAttempt.classroomGame', 'classroomGame')
			.leftJoinAndSelect('classroomGame.institutionGameOffer', 'classroomGameOffer')
			.leftJoinAndSelect('classroomGameOffer.gameVariant', 'classroomGameVariant')
			.leftJoinAndSelect('classroomGameVariant.gameVersion', 'classroomGameVersion')
			.leftJoinAndSelect('classroomGameVersion.game', 'classroomGameTitle');

		if (data.filterBy?.status) {
			queryBuilder.andWhere({ status: data.filterBy.status });
		}

		const searchQuery = data.filterBy?.q?.trim();
		if (searchQuery) {
			const searchPattern = `%${normalizeCatalogSearchQuery(searchQuery)}%`;
			const searchFields = [
				'"user"."email"', '"user"."first_name"', '"user"."last_name"', '"publicGame"."title"',
				'"institutionGame"."title"', '"classroomGameTitle"."title"',
			];
			const predicates = searchFields.map((field) =>
				`translate(lower(${field}), '${DIACRITIC_CHARACTER_LIST}', '${ASCII_CHARACTER_LIST}') like ?`,
			);
			queryBuilder.andWhere(`(${predicates.join(' or ')})`, searchFields.map(() => searchPattern));
		}

		addPagination(queryBuilder, data.pagination);
		addOrderBy(queryBuilder, undefined, 'paymentAttempt.createdAt', 'DESC');

		const [paymentAttemptList, totalItemCount] = await queryBuilder.getResultAndCount();
		return { paymentAttemptList, totalItemCount };
	}

}

@Injectable()
export class GetAdminLicenseListQuery {

	constructor(
		@InjectRepository(GameLicense)
		private readonly licenseRepository: EntityRepository<GameLicense>,
	) {}

	async execute(data: GetAdminLicenseListQueryData): Promise<{ licenseList: GameLicense[]; totalItemCount: number }> {
		const queryBuilder = this.licenseRepository.createQueryBuilder('gameLicense');
		queryBuilder
			.leftJoinAndSelect('gameLicense.user', 'user')
			.leftJoinAndSelect('gameLicense.gameVariant', 'gameVariant')
			.leftJoinAndSelect('gameVariant.gameVersion', 'gameVersion')
			.leftJoinAndSelect('gameVersion.game', 'game');

		const now = new Date();
		if (data.filterBy?.status === 'active') {
			queryBuilder.andWhere('gameLicense.startAt <= ? and gameLicense.endAt > ?', [now, now]);
		} else if (data.filterBy?.status === 'scheduled') {
			queryBuilder.andWhere('gameLicense.startAt > ?', [now]);
		} else if (data.filterBy?.status === 'expired') {
			queryBuilder.andWhere('gameLicense.endAt <= ?', [now]);
		}

		const searchQuery = data.filterBy?.q?.trim();
		if (searchQuery) {
			const searchPattern = `%${normalizeCatalogSearchQuery(searchQuery)}%`;
			const searchFields = ['"user"."email"', '"user"."first_name"', '"user"."last_name"', '"game"."title"'];
			const predicates = searchFields.map((field) =>
				`translate(lower(${field}), '${DIACRITIC_CHARACTER_LIST}', '${ASCII_CHARACTER_LIST}') like ?`,
			);
			queryBuilder.andWhere(`(${predicates.join(' or ')})`, searchFields.map(() => searchPattern));
		}

		addPagination(queryBuilder, data.pagination);
		addOrderBy(queryBuilder, undefined, 'gameLicense.createdAt', 'DESC');

		const [licenseList, totalItemCount] = await queryBuilder.getResultAndCount();
		return { licenseList, totalItemCount };
	}

}
