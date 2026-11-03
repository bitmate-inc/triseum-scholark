import { GameLicense } from '../../game/model/game.license.entity';
import { GameProgressSnapshot } from '../../game/model/game.progress.snapshot.entity';
import { ClassroomGameGradingRule } from '../model/classroom.game.grading.rule.entity';
import { ClassroomGameListing } from '../model/classroom.game.listing.entity';
import { GameGradeResult } from '../model/game.grade.result.entity';
import { getGameProgressSnapshotHash } from './game.progress.snapshot.hash';

export function getEffectiveClassroomGameGradingRuleList(
	gradingRuleList: ClassroomGameGradingRule[],
	classroomGameListingList: ClassroomGameListing[],
): ClassroomGameGradingRule[] {
	const classroomGameListingById = new Map(classroomGameListingList.map((listing) => [listing.id!, listing]));
	const latestGradingRuleByListingId = new Map<string, ClassroomGameGradingRule>();

	for (const gradingRule of [...gradingRuleList].sort((first, second) => second.revision - first.revision)) {
		const classroomGameListing = classroomGameListingById.get(gradingRule.classroomGameListing.id!);
		if (!classroomGameListing
			|| (gradingRule.createdAt && gradingRule.createdAt > classroomGameListing.endAt)
			|| latestGradingRuleByListingId.has(classroomGameListing.id!)) {
			continue;
		}

		latestGradingRuleByListingId.set(classroomGameListing.id!, gradingRule);
	}

	return [...latestGradingRuleByListingId.values()];
}

export function getCurrentOrFrozenGradeResultByLicenseId(
	gradeResultList: GameGradeResult[],
	gameLicenseList: GameLicense[],
	progressSnapshotList: GameProgressSnapshot[],
	referenceDate: Date,
): Map<string, GameGradeResult> {
	const gameLicenseById = new Map(gameLicenseList.map((license) => [license.id!, license]));
	const progressHashByLicenseId = new Map(
		progressSnapshotList.map((progressSnapshot) => [
			progressSnapshot.gameLicense.id!,
			getGameProgressSnapshotHash(progressSnapshot.schemaVersion, progressSnapshot.content),
		]),
	);
	const resultByLicenseId = new Map<string, GameGradeResult>();
	const orderedGradeResultList = [...gradeResultList].sort((first, second) =>
		getSourceProgressTimestamp(second) - getSourceProgressTimestamp(first)
		|| (second.createdAt?.getTime() ?? 0) - (first.createdAt?.getTime() ?? 0),
	);

	for (const gradeResult of orderedGradeResultList) {
		const licenseId = gradeResult.gameLicense.id!;
		const gameLicense = gameLicenseById.get(licenseId);
		if (!gameLicense || resultByLicenseId.has(licenseId)) {
			continue;
		}

		const listingEndAt = gameLicense.classroomGameListing?.endAt;
		const listingHasExpired = listingEndAt !== undefined && listingEndAt <= referenceDate;
		const sourceProgressUpdatedAt = gradeResult.sourceProgressUpdatedAt ?? gradeResult.createdAt;
		const isEligible = listingHasExpired
			? sourceProgressUpdatedAt !== undefined && sourceProgressUpdatedAt <= listingEndAt
			: progressHashByLicenseId.get(licenseId) === gradeResult.sourceProgressHash;

		if (isEligible) {
			resultByLicenseId.set(licenseId, gradeResult);
		}
	}

	return resultByLicenseId;
}

function getSourceProgressTimestamp(gradeResult: GameGradeResult): number {
	return gradeResult.sourceProgressUpdatedAt?.getTime() ?? gradeResult.createdAt?.getTime() ?? 0;
}