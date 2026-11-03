import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	ArrayMaxSize,
	ArrayUnique,
	IsArray,
	IsEnum,
	IsInt,
	IsNumber,
	IsOptional,
	IsString,
	Matches,
	Max,
	MaxLength,
	Min,
} from 'class-validator';

import { Classroom } from '../../core/feature/education/model/classroom.entity';
import { ClassroomGameGradingMethod, ClassroomGameGradingRule } from '../../core/feature/education/model/classroom.game.grading.rule.entity';
import { ClassroomGameListing } from '../../core/feature/education/model/classroom.game.listing.entity';
import {
	type GameGradeActivityProgress,
	type GameGradeProgress,
	GameGradeResult,
	type GameGradeResultContent,
	type GameGradeSectionResult,
} from '../../core/feature/education/model/game.grade.result.entity';
import { Instructor } from '../../core/feature/education/model/instructor.entity';
import type { GetInstructorClassroomResult } from '../../core/feature/education/query/get.instructor.portal.query';
import { GameLicense } from '../../core/feature/game/model/game.license.entity';
import {
	type GameProgressSection,
	GameProgressSnapshot,
	type GameProgressSummary,
} from '../../core/feature/game/model/game.progress.snapshot.entity';
import type {
	GameProgressMetricDefinition,
	GameProgressSectionDefinition,
	GameProgressStructure,
} from '../../core/feature/game/model/game.progress.structure';

export class CreateInstructorClassroomGameGradingRuleRequestDto {

	@ApiProperty({ minimum: 1 })
	@IsInt()
	@Min(1)
	schemaVersion!: number;

	@ApiProperty({ minimum: 1 })
	@IsInt()
	@Min(1)
	progressSchemaVersion!: number;

	@ApiProperty({ enum: ['points', 'completion_threshold'] })
	@IsEnum(ClassroomGameGradingMethod)
	method!: ClassroomGameGradingMethod;

	@ApiProperty({ type: [String], maxItems: 100, pattern: '^(0|[1-9]\\d*)(\\.(0|[1-9]\\d*))*$' })
	@IsArray()
	@ArrayMaxSize(100)
	@ArrayUnique()
	@IsString({ each: true })
	@Matches(/^(0|[1-9]\d*)(\.(0|[1-9]\d*))*$/, { each: true })
	@MaxLength(200, { each: true })
	sectionIndexList!: string[];

	@ApiProperty({ minimum: 0.01, type: Number })
	@IsNumber({ allowNaN: false, allowInfinity: false })
	@Min(0.01)
	scoreMaximum!: number;

	@ApiPropertyOptional({ minimum: 0, maximum: 100, type: Number })
	@IsOptional()
	@IsNumber({ allowNaN: false, allowInfinity: false })
	@Min(0)
	@Max(100)
	completionThresholdPercent?: number;

}

export class InstructorClassroomGameGradingRuleResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	revision!: number;

	@ApiProperty({ type: CreateInstructorClassroomGameGradingRuleRequestDto })
	config!: CreateInstructorClassroomGameGradingRuleRequestDto;

	@ApiProperty({ format: 'date-time' })
	createdAt!: Date;

	static fromEntity(gradingRule: ClassroomGameGradingRule): InstructorClassroomGameGradingRuleResponseDto {
		return {
			config: gradingRule.config,
			createdAt: gradingRule.createdAt!,
			id: gradingRule.id!,
			revision: gradingRule.revision,
		};
	}

}

class InstructorProgressSummaryResponseDto implements GameProgressSummary {

	@ApiPropertyOptional({ type: Number, nullable: true })
	playTimeSeconds?: number | null;

	@ApiPropertyOptional({ nullable: true })
	sessionCount?: number | null;

	@ApiPropertyOptional({ type: Number, minimum: 0, maximum: 100, nullable: true })
	completionPercent?: number | null;

	@ApiPropertyOptional({ nullable: true })
	completed?: boolean | null;

	@ApiPropertyOptional({ type: Object, nullable: true })
	metrics?: Record<string, number | null> | null;

}

class InstructorProgressSectionResponseDto implements GameProgressSection {

	@ApiProperty({ maxLength: 200 })
	sectionIndex!: string;

	@ApiPropertyOptional({ type: Number, minimum: 0, maximum: 100, nullable: true })
	completionPercent?: number | null;

	@ApiPropertyOptional({ nullable: true })
	completed?: boolean | null;

	@ApiPropertyOptional({ type: Object, nullable: true })
	metrics?: Record<string, number | null> | null;

}

class InstructorProgressMetricDefinitionResponseDto implements GameProgressMetricDefinition {

	@ApiProperty({ maxLength: 120 })
	key!: string;

	@ApiProperty({ maxLength: 200 })
	label!: string;

	@ApiPropertyOptional({ minimum: 0.01, type: Number })
	pointsPossible?: number;

}

class InstructorProgressStructureSectionResponseDto implements GameProgressSectionDefinition {

	@ApiProperty({ maxLength: 200, pattern: '^(0|[1-9]\\d*)(\\.(0|[1-9]\\d*))*$' })
	sectionIndex!: string;

	@ApiProperty({ maxLength: 200 })
	label!: string;

	@ApiProperty({ type: [InstructorProgressMetricDefinitionResponseDto] })
	metricList!: InstructorProgressMetricDefinitionResponseDto[];

}

class InstructorProgressStructureResponseDto implements GameProgressStructure {

	@ApiProperty({ minimum: 1 })
	schemaVersion!: number;

	@ApiProperty({ type: [InstructorProgressStructureSectionResponseDto] })
	sectionList!: InstructorProgressStructureSectionResponseDto[];

}

class InstructorProgressResponseDto {

	@ApiProperty({ minimum: 1 })
	schemaVersion!: number;

	@ApiProperty({ type: String, format: 'date-time' })
	updatedAt!: Date;

	@ApiPropertyOptional({ type: InstructorProgressSummaryResponseDto, nullable: true })
	summary?: InstructorProgressSummaryResponseDto | null;

	@ApiPropertyOptional({ type: [InstructorProgressSectionResponseDto] })
	sectionList?: InstructorProgressSectionResponseDto[];

}

class InstructorGradeSectionResultResponseDto implements GameGradeSectionResult {

	@ApiProperty({ maxLength: 200 })
	sectionIndex!: string;

	@ApiProperty({ maxLength: 200 })
	label!: string;

	@ApiProperty({ type: Number })
	points!: number;

	@ApiProperty({ type: Number })
	pointsPossible!: number;

	@ApiProperty({ type: Number })
	percentage!: number;

}

class InstructorGradeResultContentResponseDto implements GameGradeResultContent {

	@ApiProperty({ type: Number, nullable: true })
	scoreGiven!: number | null;

	@ApiProperty({ type: Number })
	scoreMaximum!: number;

	@ApiProperty({ type: Number, nullable: true })
	percentage!: number | null;

	@ApiProperty({ enum: ['unknown', 'in_progress', 'completed'] })
	activityProgress!: GameGradeActivityProgress;

	@ApiProperty({ enum: ['not_ready', 'pending', 'fully_graded', 'incompatible'] })
	gradingProgress!: GameGradeProgress;

	@ApiProperty({ type: [InstructorGradeSectionResultResponseDto] })
	sectionResultList!: InstructorGradeSectionResultResponseDto[];

}

class InstructorGradeResultResponseDto {

	@ApiProperty()
	ruleRevision!: number;

	@ApiProperty({ type: InstructorGradeResultContentResponseDto })
	content!: InstructorGradeResultContentResponseDto;

	@ApiProperty({ type: String, format: 'date-time' })
	createdAt!: Date;

}

class InstructorInstitutionResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

	static fromEntity(institution: Classroom['institution']): InstructorInstitutionResponseDto {
		return { id: institution.id!, name: institution.name, slug: institution.slug };
	}

}

export class InstructorProfileResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

	static fromEntity(instructor: Instructor): InstructorProfileResponseDto {
		return { id: instructor.id!, name: instructor.name, slug: instructor.slug };
	}

}

export class InstructorClassroomListItemResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ type: InstructorInstitutionResponseDto })
	institution!: InstructorInstitutionResponseDto;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	code!: string;

	@ApiProperty()
	slug!: string;

	@ApiProperty()
	language!: string;

	@ApiProperty({ enum: ['standard', 'game-based'] })
	courseType!: 'standard' | 'game-based';

	static fromEntity(classroom: Classroom): InstructorClassroomListItemResponseDto {
		return {
			code: classroom.code,
			courseType: classroom.courseType,
			id: classroom.id!,
			institution: InstructorInstitutionResponseDto.fromEntity(classroom.institution),
			language: classroom.language,
			name: classroom.name,
			slug: classroom.slug,
		};
	}

}

export class InstructorClassroomListResponseDto {

	@ApiProperty({ type: [InstructorClassroomListItemResponseDto] })
	classroomList!: InstructorClassroomListItemResponseDto[];

	static fromEntityList(classroomList: Classroom[]): InstructorClassroomListResponseDto {
		return { classroomList: classroomList.map(InstructorClassroomListItemResponseDto.fromEntity) };
	}

}

class InstructorStudentResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	email!: string;

	@ApiProperty({ required: false })
	firstName?: string;

	@ApiProperty({ required: false })
	lastName?: string;

	@ApiProperty({ enum: ['active', 'upcoming', 'expired'] })
	licenseStatus!: 'active' | 'upcoming' | 'expired';

	@ApiProperty({ format: 'date-time' })
	startAt!: Date;

	@ApiProperty({ format: 'date-time' })
	endAt!: Date;

	@ApiPropertyOptional({ type: InstructorProgressResponseDto })
	progress?: InstructorProgressResponseDto;

	@ApiPropertyOptional({ type: InstructorGradeResultResponseDto })
	gradeResult?: InstructorGradeResultResponseDto;

	static fromEntity(
		license: GameLicense,
		referenceDate: Date,
		progressSnapshot?: GameProgressSnapshot,
		gradeResult?: GameGradeResult,
	): InstructorStudentResponseDto {
		const licenseStatus = license.isActive(referenceDate)
			? 'active'
			: license.startAt > referenceDate ? 'upcoming' : 'expired';

		return {
			email: license.user.email,
			endAt: license.endAt,
			firstName: license.user.firstName,
			id: license.user.id!,
			lastName: license.user.lastName,
			licenseStatus,
			progress: progressSnapshot ? {
				...progressSnapshot.content,
				schemaVersion: progressSnapshot.schemaVersion,
				updatedAt: progressSnapshot.updatedAt!,
			} : undefined,
			gradeResult: gradeResult ? {
				content: gradeResult.content,
				createdAt: gradeResult.createdAt!,
				ruleRevision: gradeResult.gradingRule.revision,
			} : undefined,
			startAt: license.startAt,
		};
	}

}

class InstructorClassroomGameListingResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	gameTitle!: string;

	@ApiProperty()
	isGradingFinalized!: boolean;

	@ApiProperty()
	publisherVersion!: string;

	@ApiProperty({ type: [InstructorStudentResponseDto] })
	studentList!: InstructorStudentResponseDto[];

	@ApiPropertyOptional({ type: InstructorClassroomGameGradingRuleResponseDto })
	gradingRule?: InstructorClassroomGameGradingRuleResponseDto;

	@ApiPropertyOptional({ type: InstructorProgressStructureResponseDto })
	progressStructure?: GameProgressStructure;

	static fromQueryResult(
		classroomGameListing: ClassroomGameListing,
		gameLicenseList: GameLicense[],
		progressSnapshotList: GameProgressSnapshot[],
		gradingRule: ClassroomGameGradingRule | undefined,
		gradeResultList: GameGradeResult[],
		referenceDate: Date,
	): InstructorClassroomGameListingResponseDto {
		const licenseList = getLatestListingLicenseList(classroomGameListing, gameLicenseList);
		const progressSnapshotByLicenseId = new Map(
			progressSnapshotList.map((progressSnapshot) => [progressSnapshot.gameLicense.id!, progressSnapshot]),
		);
		const gradeResultByLicenseId = new Map<string, GameGradeResult>();
		for (const gradeResult of gradeResultList) {
			if (gradeResult.gradingRule.id === gradingRule?.id && !gradeResultByLicenseId.has(gradeResult.gameLicense.id!)) {
				gradeResultByLicenseId.set(gradeResult.gameLicense.id!, gradeResult);
			}
		}

		return {
			gameTitle: classroomGameListing.gameVersion.game.title,
			isGradingFinalized: classroomGameListing.isExpired(referenceDate),
			gradingRule: gradingRule ? InstructorClassroomGameGradingRuleResponseDto.fromEntity(gradingRule) : undefined,
			id: classroomGameListing.id!,
			progressStructure: classroomGameListing.gameVersion.progressStructure,
			publisherVersion: classroomGameListing.gameVersion.publisherVersion,
			studentList: licenseList.map((license) => InstructorStudentResponseDto.fromEntity(
				license,
				referenceDate,
				progressSnapshotByLicenseId.get(license.id!),
				gradeResultByLicenseId.get(license.id!),
			)),
		};
	}

}

function getLatestListingLicenseList(classroomGameListing: ClassroomGameListing, gameLicenseList: GameLicense[]): GameLicense[] {
	const latestLicenseByUserId = new Map<string, GameLicense>();
	for (const license of gameLicenseList) {
		if (license.classroomGameListing?.id === classroomGameListing.id && !latestLicenseByUserId.has(license.user.id!)) {
			latestLicenseByUserId.set(license.user.id!, license);
		}
	}

	return [...latestLicenseByUserId.values()];
}

export class InstructorClassroomResponseDto {

	@ApiProperty({ type: InstructorClassroomListItemResponseDto })
	classroom!: InstructorClassroomListItemResponseDto;

	@ApiProperty({ type: [InstructorClassroomGameListingResponseDto] })
	classroomGameListingList!: InstructorClassroomGameListingResponseDto[];

	static fromQueryResult(result: GetInstructorClassroomResult): InstructorClassroomResponseDto {
		const referenceDate = new Date();

		return {
			classroom: InstructorClassroomListItemResponseDto.fromEntity(result.classroom),
			classroomGameListingList: result.classroomGameListingList.map((listing) =>
				InstructorClassroomGameListingResponseDto.fromQueryResult(
					listing,
					result.gameLicenseList,
					result.progressSnapshotList,
					result.gradingRuleList.find((gradingRule) => gradingRule.classroomGameListing.id === listing.id),
					result.gradeResultList,
					referenceDate,
				),
			),
		};
	}

}