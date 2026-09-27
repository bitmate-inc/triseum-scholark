import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { addOrderBy, addPagination } from '../../../../../lib/database/mikro.orm.query';
import type { PaginationDto } from '../../../../../lib/entity/query/query.dto';
import { AcquisitionCode } from '../../education/model/acquisition.code.entity';
import { AcquisitionCodeRedemption } from '../../education/model/acquisition.code.redemption.entity';
import { GameAcquisitionEvent } from '../../game/model/game.acquisition.event.entity';

export interface GetAdminAcquisitionCodeListQueryData {
	filterBy?: { id?: string | string[]; institutionId?: string; q?: string };
	pagination?: PaginationDto;
}

export class GetAdminAcquisitionCodeListQueryResult {

	acquisitionCodeList!: AcquisitionCode[];
	redemptionListByCodeId!: Map<string, AcquisitionCodeRedemption[]>;
	eventListByCodeId!: Map<string, GameAcquisitionEvent[]>;
	totalItemCount!: number;

}

@Injectable()
export class GetAdminAcquisitionCodeListQuery {

	constructor(
		@InjectRepository(AcquisitionCode)
		private readonly acquisitionCodeRepository: EntityRepository<AcquisitionCode>,
		@InjectRepository(AcquisitionCodeRedemption)
		private readonly redemptionRepository: EntityRepository<AcquisitionCodeRedemption>,
	) {}

	async execute(data: GetAdminAcquisitionCodeListQueryData): Promise<GetAdminAcquisitionCodeListQueryResult> {
		const queryBuilder = this.acquisitionCodeRepository.createQueryBuilder('acquisitionCode');
		queryBuilder
			.leftJoinAndSelect('acquisitionCode.classroomGame', 'classroomGame')
			.leftJoinAndSelect('classroomGame.classroom', 'classroom')
			.leftJoinAndSelect('classroom.institution', 'institution')
			.leftJoinAndSelect('classroomGame.institutionGameOffer', 'institutionGameOffer')
			.leftJoinAndSelect('institutionGameOffer.gameVariant', 'gameVariant')
			.leftJoinAndSelect('gameVariant.gameVersion', 'gameVersion')
			.leftJoinAndSelect('gameVersion.game', 'game');

		if (data.filterBy?.id) {
			queryBuilder.andWhere({ id: data.filterBy.id });
		}
		if (data.filterBy?.institutionId) {
			queryBuilder.andWhere({ classroomGame: { classroom: { institution: data.filterBy.institutionId } } });
		}

		const searchQuery = data.filterBy?.q?.trim();
		if (searchQuery) {
			const searchPattern = `%${searchQuery.toLowerCase()}%`;
			const normalizedCodeQuery = searchQuery.replace(/[\s-]/g, '').toLowerCase();
			const codeSuffixPattern = `%${normalizedCodeQuery.slice(-4)}%`;
			queryBuilder.andWhere(
				'(lower("acquisitionCode"."code_suffix") like ? or lower("game"."title") like ? or lower("classroom"."name") like ? or lower("institution"."name") like ?)',
				[codeSuffixPattern, searchPattern, searchPattern, searchPattern],
			);
		}

		addPagination(queryBuilder, data.pagination);
		addOrderBy(queryBuilder, undefined, 'acquisitionCode.createdAt', 'DESC');
		const [acquisitionCodeList, totalItemCount] = await queryBuilder.getResultAndCount();
		const codeIdList = acquisitionCodeList.map(({ id }) => id!);
		const redemptionList = codeIdList.length === 0
			? []
			: await this.redemptionRepository.find(
				{ acquisitionCode: { $in: codeIdList } },
				{ orderBy: { redeemedAt: 'DESC' }, populate: ['redeemedBy'] },
			);
		const redemptionListByCodeId = new Map<string, AcquisitionCodeRedemption[]>();
		for (const redemption of redemptionList) {
			const codeId = redemption.acquisitionCode.id!;
			const codeRedemptionList = redemptionListByCodeId.get(codeId) ?? [];
			codeRedemptionList.push(redemption);
			redemptionListByCodeId.set(codeId, codeRedemptionList);
		}
		const eventList = codeIdList.length === 0
			? []
			: await this.acquisitionCodeRepository.getEntityManager().find(
				GameAcquisitionEvent,
				{ acquisitionCode: { $in: codeIdList } },
				{ orderBy: { createdAt: 'ASC', id: 'ASC' }, populate: ['actorUser'] },
			);
		const eventListByCodeId = new Map<string, GameAcquisitionEvent[]>();
		for (const event of eventList) {
			const codeId = event.acquisitionCode!.id!;
			const codeEventList = eventListByCodeId.get(codeId) ?? [];
			codeEventList.push(event);
			eventListByCodeId.set(codeId, codeEventList);
		}

		return { acquisitionCodeList, eventListByCodeId, redemptionListByCodeId, totalItemCount };
	}

}