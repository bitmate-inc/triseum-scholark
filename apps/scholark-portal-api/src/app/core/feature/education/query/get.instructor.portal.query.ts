import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { GameLicense } from '../../game/model/game.license.entity';
import { GameProgressSnapshot } from '../../game/model/game.progress.snapshot.entity';
import { Classroom } from '../model/classroom.entity';
import { ClassroomGameGradingRule } from '../model/classroom.game.grading.rule.entity';
import { ClassroomGameListing } from '../model/classroom.game.listing.entity';
import { GameGradeResult } from '../model/game.grade.result.entity';
import { Instructor } from '../model/instructor.entity';
import { InstructorUser } from '../model/instructor.user.entity';
import { getCurrentOrFrozenGradeResultByLicenseId, getEffectiveClassroomGameGradingRuleList } from '../service/classroom.game.grade.lifecycle';

export interface GetInstructorClassroomResult {
	classroom: Classroom;
	classroomGameListingList: ClassroomGameListing[];
	gameLicenseList: GameLicense[];
	progressSnapshotList: GameProgressSnapshot[];
	gradingRuleList: ClassroomGameGradingRule[];
	gradeResultList: GameGradeResult[];
}

@Injectable()
export class GetInstructorProfileQuery {

	constructor(private readonly entityManager: EntityManager) {}

	async execute(userId: string): Promise<Instructor | undefined> {
		const instructorUser = await this.entityManager.findOne(
			InstructorUser,
			{ user: userId },
			{ populate: ['instructor'] },
		);

		return instructorUser?.instructor;
	}

}

@Injectable()
export class GetInstructorClassroomListQuery {

	constructor(private readonly entityManager: EntityManager) {}

	async execute(userId: string): Promise<Classroom[]> {
		const instructorUser = await this.entityManager.findOne(
			InstructorUser,
			{ user: userId },
			{ populate: ['instructor'] },
		);
		if (!instructorUser) {
			return [];
		}

		return this.entityManager.find(
			Classroom,
			{ instructorList: instructorUser.instructor.id! },
			{ populate: ['institution'], orderBy: { name: 'ASC' } },
		);
	}

}

@Injectable()
export class GetInstructorClassroomQuery {

	constructor(private readonly entityManager: EntityManager) {}

	async execute(userId: string, classroomId: string): Promise<GetInstructorClassroomResult | undefined> {
		const instructorUser = await this.entityManager.findOne(
			InstructorUser,
			{ user: userId },
			{ populate: ['instructor'] },
		);
		if (!instructorUser) {
			return undefined;
		}

		const classroom = await this.entityManager.findOne(
			Classroom,
			{ id: classroomId, instructorList: instructorUser.instructor.id! },
			{ populate: ['institution'] },
		);
		if (!classroom) {
			return undefined;
		}

		const classroomGameListingList = await this.entityManager.find(
			ClassroomGameListing,
			{ classroom: classroom.id! },
			{ populate: ['gameVersion.game.publisher'], orderBy: { createdAt: 'ASC' } },
		);

		const classroomGameListingIdList = classroomGameListingList.map(({ id }) => id!);
		const gameLicenseList = classroomGameListingIdList.length === 0
			? []
			: await this.entityManager.find(
				GameLicense,
				{ classroomGameListing: { id: { $in: classroomGameListingIdList } } },
				{ populate: ['user', 'classroomGameListing'], orderBy: { createdAt: 'DESC' } },
			);
		const gradingRuleList = classroomGameListingIdList.length === 0
			? []
			: await this.entityManager.find(
				ClassroomGameGradingRule,
				{ classroomGameListing: { id: { $in: classroomGameListingIdList } } },
				{ orderBy: { revision: 'DESC' } },
			);
		const latestGradingRuleList = getEffectiveClassroomGameGradingRuleList(gradingRuleList, classroomGameListingList);
		const [progressSnapshotList, gradeResultList] = gameLicenseList.length === 0
			? [[], []]
			: await Promise.all([
				this.entityManager.find(GameProgressSnapshot, {
					gameLicense: { $in: gameLicenseList },
				}),
				latestGradingRuleList.length === 0
					? Promise.resolve([])
					: this.entityManager.find(
						GameGradeResult,
						{
							gameLicense: { $in: gameLicenseList },
							gradingRule: { $in: latestGradingRuleList },
						},
						{ orderBy: { sourceProgressUpdatedAt: 'DESC', createdAt: 'DESC' }, populate: ['gradingRule'] },
					),
			]);
		const gradeResultByLicenseId = getCurrentOrFrozenGradeResultByLicenseId(
			gradeResultList,
			gameLicenseList,
			progressSnapshotList,
			new Date(),
		);

		return {
			classroom,
			classroomGameListingList,
			gameLicenseList,
			progressSnapshotList,
			gradingRuleList: latestGradingRuleList,
			gradeResultList: [...gradeResultByLicenseId.values()],
		};
	}

}