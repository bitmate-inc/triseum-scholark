import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { GameLicense } from '../../game/model/game.license.entity';
import { GameProgressSnapshot } from '../../game/model/game.progress.snapshot.entity';
import { ClassroomGameGradingRule } from '../model/classroom.game.grading.rule.entity';
import { GameGradeResult } from '../model/game.grade.result.entity';
import { calculateClassroomGameGrade } from '../service/classroom.game.grading.calculator';
import { getGameProgressSnapshotHash } from '../service/game.progress.snapshot.hash';

@Injectable()
export class CalculateGameLicenseGradeCommand {

	constructor(private readonly entityManager: EntityManager) {}

	async execute(gameLicenseId: string): Promise<void> {
		const license = await this.entityManager.findOne(
			GameLicense,
			{ id: gameLicenseId },
			{ populate: ['classroomGameListing', 'gameVersion'] },
		);
		if (!license?.classroomGameListing) {
			return;
		}

		const [gradingRule, progressSnapshot] = await Promise.all([
			this.entityManager.findOne(
				ClassroomGameGradingRule,
				{ classroomGameListing: license.classroomGameListing },
				{ orderBy: { revision: 'DESC' } },
			),
			this.entityManager.findOne(GameProgressSnapshot, { gameLicense: license }),
		]);
		if (!gradingRule || !progressSnapshot) {
			return;
		}
		const sourceProgressHash = getGameProgressSnapshotHash(progressSnapshot.schemaVersion, progressSnapshot.content);

		const gradeResult = this.entityManager.create(GameGradeResult, {
			content: calculateClassroomGameGrade(
				progressSnapshot.schemaVersion,
				license.gameVersion.progressStructure,
				progressSnapshot.content,
				gradingRule.config,
			),
			gameLicense: license,
			gradingRule,
			progressSnapshot,
			sourceProgressContent: progressSnapshot.content,
			sourceProgressHash,
			sourceProgressUpdatedAt: progressSnapshot.updatedAt!,
		});

		await this.entityManager.upsert(GameGradeResult, gradeResult, {
			onConflictAction: 'ignore',
			onConflictFields: ['gameLicense', 'gradingRule', 'sourceProgressHash'],
		});
	}

}