import { LockMode } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { validateGameProgressStructure } from '../../game/model/game.progress.structure';
import { User } from '../../user/model/user.entity';
import {
	ClassroomGameGradingMethod,
	ClassroomGameGradingRule,
	type ClassroomGameGradingRuleConfig,
} from '../model/classroom.game.grading.rule.entity';
import { ClassroomGameListing } from '../model/classroom.game.listing.entity';
import { GetInstructorClassroomQuery } from '../query/get.instructor.portal.query';
import { RecalculateClassroomGameGradesCommand } from './recalculate.classroom.game.grades.command';

export type CreateClassroomGameGradingRuleCommandData = {
	classroomGameListingId: string;
	classroomId: string;
	config: ClassroomGameGradingRuleConfig;
	userId: string;
};

@Injectable()
export class CreateClassroomGameGradingRuleCommand {

	constructor(
		private readonly entityManager: EntityManager,
		private readonly getInstructorClassroomQuery: GetInstructorClassroomQuery,
		private readonly recalculateClassroomGameGradesCommand: RecalculateClassroomGameGradesCommand,
	) {}

	async execute(data: CreateClassroomGameGradingRuleCommandData): Promise<ClassroomGameGradingRule> {
		validateGradingRuleConfig(data.config);

		const classroomResult = await this.getInstructorClassroomQuery.execute(data.userId, data.classroomId);
		const classroomGameListing = classroomResult?.classroomGameListingList.find((listing) => listing.id === data.classroomGameListingId);
		if (!classroomGameListing) {
			throw new NotFoundException('Classroom game listing not found.');
		}
		const progressStructure = classroomGameListing.gameVersion.progressStructure;
		if (!progressStructure || progressStructure.schemaVersion !== data.config.progressSchemaVersion) {
			throw new BadRequestException('Grading rule must match the configured GameVersion progress structure.');
		}
		const structureValidationError = validateGameProgressStructure(progressStructure);
		if (structureValidationError) {
			throw new BadRequestException(structureValidationError);
		}
		const sectionByIndex = new Map(progressStructure.sectionList.map((section) => [section.sectionIndex, section]));
		for (const sectionIndex of data.config.sectionIndexList) {
			const section = sectionByIndex.get(sectionIndex);
			if (!section) {
				throw new BadRequestException(`Unknown GameVersion section index: ${sectionIndex}.`);
			}
			if (data.config.method === ClassroomGameGradingMethod.POINTS
				&& !section.metricList.some((metric) => metric.pointsPossible !== undefined)) {
				throw new BadRequestException(`Section ${sectionIndex} has no gradeable point metric.`);
			}
		}

		const gradingRule = await this.entityManager.transactional(async (transactionalEntityManager) => {
			const classroomGameListing = await transactionalEntityManager.findOne(
				ClassroomGameListing,
				{ id: data.classroomGameListingId, classroom: data.classroomId },
				{ lockMode: LockMode.PESSIMISTIC_WRITE },
			);
			if (!classroomGameListing) {
				throw new NotFoundException('Classroom game listing not found.');
			}

			const latestGradingRule = await transactionalEntityManager.findOne(
				ClassroomGameGradingRule,
				{ classroomGameListing },
				{ orderBy: { revision: 'DESC' } },
			);
			const nextRevision = (latestGradingRule?.revision ?? 0) + 1;
			const nextGradingRule = transactionalEntityManager.create(ClassroomGameGradingRule, {
				classroomGameListing,
				config: data.config,
				createdBy: transactionalEntityManager.getReference(User, data.userId),
				revision: nextRevision,
			});

			transactionalEntityManager.persist(nextGradingRule);
			await transactionalEntityManager.flush();
			return nextGradingRule;
		});

		await this.recalculateClassroomGameGradesCommand.execute(data.classroomGameListingId);
		return gradingRule;
	}

}

function validateGradingRuleConfig(config: ClassroomGameGradingRuleConfig): void {
	if (config.schemaVersion !== 1 || !Number.isInteger(config.progressSchemaVersion) || config.progressSchemaVersion < 1) {
		throw new BadRequestException('Unsupported grading or progress schema version.');
	}
	if (!Number.isFinite(config.scoreMaximum) || config.scoreMaximum <= 0) {
		throw new BadRequestException('Grading score maximum must be greater than zero.');
	}
	if (new Set(config.sectionIndexList).size !== config.sectionIndexList.length) {
		throw new BadRequestException('Grading section indices must be unique.');
	}
	if (config.method === ClassroomGameGradingMethod.POINTS && config.sectionIndexList.length === 0) {
		throw new BadRequestException('Points grading requires at least one section.');
	}
	if (config.method === ClassroomGameGradingMethod.COMPLETION_THRESHOLD
		&& (config.completionThresholdPercent === undefined
			|| !Number.isFinite(config.completionThresholdPercent)
			|| config.completionThresholdPercent < 0
			|| config.completionThresholdPercent > 100)) {
		throw new BadRequestException('Completion threshold must be between zero and one hundred.');
	}
	if (config.method === ClassroomGameGradingMethod.COMPLETION_THRESHOLD && config.allowPartial) {
		throw new BadRequestException('Completion threshold grading does not support partial grades.');
	}
}