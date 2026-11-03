import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { ClassroomGameGradingRule } from '../../education/model/classroom.game.grading.rule.entity';
import { GameGradeResult } from '../../education/model/game.grade.result.entity';
import { getCurrentOrFrozenGradeResultByLicenseId, getEffectiveClassroomGameGradingRuleList } from '../../education/service/classroom.game.grade.lifecycle';
import { GameAcquisition } from '../../game/model/game.acquisition.entity';
import { GameLicense } from '../../game/model/game.license.entity';
import { GameProgressSnapshot } from '../../game/model/game.progress.snapshot.entity';

export type UserLibraryItem = {
	license: GameLicense;
	acquisition?: GameAcquisition;
	progressSnapshot?: GameProgressSnapshot;
	gradeResult?: GameGradeResult;
};

@Injectable()
export class GetUserLibraryQuery {

	constructor(private readonly entityManager: EntityManager) {}

	async execute(userId: string): Promise<UserLibraryItem[]> {
		const licenseList = await this.entityManager.find(
			GameLicense,
			{ user: userId },
			{
				populate: [
					'gameVersion.game',
					'customization',
					'classroomGameListing.classroom',
					'classroomGameListing.customization',
				],
				orderBy: { endAt: 'desc' },
			},
		);
		if (licenseList.length === 0) {
			return [];
		}

		const classroomGameListingIdList = [...new Set(
			licenseList.map((license) => license.classroomGameListing?.id).filter((id): id is string => Boolean(id)),
		)];
		const [acquisitionList, progressSnapshotList, gradingRuleList] = await Promise.all([
			this.entityManager.find(GameAcquisition, {
				license: { $in: licenseList },
			}),
			this.entityManager.find(GameProgressSnapshot, {
				gameLicense: { $in: licenseList },
			}),
			classroomGameListingIdList.length === 0
				? Promise.resolve([])
				: this.entityManager.find(
					ClassroomGameGradingRule,
					{ classroomGameListing: { id: { $in: classroomGameListingIdList } } },
					{ orderBy: { revision: 'DESC' } },
				),
		]);
		const acquisitionByLicenseId = new Map(acquisitionList.map((acquisition) => [acquisition.license.id, acquisition]));
		const progressSnapshotByLicenseId = new Map(
			progressSnapshotList.map((progressSnapshot) => [progressSnapshot.gameLicense.id, progressSnapshot]),
		);
		const classroomGameListingList = licenseList
			.map((license) => license.classroomGameListing)
			.filter((listing): listing is NonNullable<GameLicense['classroomGameListing']> => Boolean(listing));
		const latestGradingRuleList = getEffectiveClassroomGameGradingRuleList(gradingRuleList, classroomGameListingList);
		const gradeResultList = latestGradingRuleList.length === 0
			? []
			: await this.entityManager.find(
				GameGradeResult,
				{
					gameLicense: { $in: licenseList },
					gradingRule: { $in: latestGradingRuleList },
				},
				{ orderBy: { sourceProgressUpdatedAt: 'DESC', createdAt: 'DESC' }, populate: ['gradingRule'] },
			);
		const currentGradeResultByLicenseId = getCurrentOrFrozenGradeResultByLicenseId(
			gradeResultList,
			licenseList,
			progressSnapshotList,
			new Date(),
		);

		return licenseList
			.sort((firstLicense, secondLicense) => {
				const now = new Date();
				const getStatusOrder = (license: GameLicense): number => {
					if (license.isActive(now)) return 2;
					if (license.startAt > now) return 1;

					return 0;
				};
				const firstStatusOrder = getStatusOrder(firstLicense);
				const secondStatusOrder = getStatusOrder(secondLicense);

				return secondStatusOrder - firstStatusOrder
					|| secondLicense.endAt.getTime() - firstLicense.endAt.getTime()
					|| secondLicense.createdAt!.getTime() - firstLicense.createdAt!.getTime();
			})
			.map((license) => {
				const gradeResult = currentGradeResultByLicenseId.get(license.id!);

				return {
					license,
					acquisition: acquisitionByLicenseId.get(license.id!),
					progressSnapshot: progressSnapshotByLicenseId.get(license.id!),
					...(gradeResult ? { gradeResult } : {}),
				};
			});
	}

}