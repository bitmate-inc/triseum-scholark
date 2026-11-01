import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UserLibraryItem } from '../../core/feature/catalog/query/get.user.library.query';
import type { GameProgressSection, GameProgressSummary } from '../../core/feature/game/model/game.progress.snapshot.entity';

class UserLibraryProgressSummaryResponseDto implements GameProgressSummary {

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

class UserLibraryProgressSectionResponseDto implements GameProgressSection {

	@ApiProperty({ maxLength: 200 })
	sectionIndex!: string;

	@ApiPropertyOptional({ minimum: 0, maximum: 100, type: Number, nullable: true })
	completionPercent?: number | null;

	@ApiPropertyOptional({ nullable: true })
	completed?: boolean | null;

	@ApiPropertyOptional({ type: Object, nullable: true })
	metrics?: Record<string, number | null> | null;

}

class UserLibraryProgressResponseDto {

	@ApiProperty({ minimum: 1 })
	schemaVersion!: number;

	@ApiProperty({ type: String, format: 'date-time' })
	updatedAt!: Date;

	@ApiPropertyOptional({ type: UserLibraryProgressSummaryResponseDto, nullable: true })
	summary?: UserLibraryProgressSummaryResponseDto | null;

	@ApiPropertyOptional({ type: [UserLibraryProgressSectionResponseDto] })
	sectionList?: UserLibraryProgressSectionResponseDto[];

}

class UserLibraryGameResponseDto {

	@ApiProperty()
	id!: string;

	@ApiProperty()
	title!: string;

	@ApiProperty()
	slug!: string;

}

class UserLibraryVersionResponseDto {

	@ApiProperty()
	id!: string;

	@ApiProperty()
	publisherVersion!: string;

	@ApiProperty({ format: 'uri' })
	runUrl!: string;

}

class UserLibraryClassroomResponseDto {

	@ApiProperty()
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

}

class UserLibraryItemResponseDto {

	@ApiProperty()
	id!: string;

	@ApiProperty({ type: UserLibraryGameResponseDto })
	game!: UserLibraryGameResponseDto;

	@ApiProperty({ type: UserLibraryVersionResponseDto })
	gameVersion!: UserLibraryVersionResponseDto;

	@ApiProperty()
	language!: string;

	@ApiProperty()
	courseType!: string;

	@ApiPropertyOptional()
	customizationId?: string;

	@ApiPropertyOptional({ type: UserLibraryClassroomResponseDto })
	classroom?: UserLibraryClassroomResponseDto;

	@ApiPropertyOptional()
	classroomGameListingId?: string;

	@ApiProperty()
	startAt!: Date;

	@ApiProperty()
	endAt!: Date;

	@ApiProperty()
	createdAt!: Date;

	@ApiProperty()
	isActive!: boolean;

	@ApiProperty({ enum: ['active', 'scheduled', 'expired'] })
	status!: 'active' | 'scheduled' | 'expired';

	@ApiProperty()
	acquisitionMechanism!: string;

	@ApiPropertyOptional({ type: UserLibraryProgressResponseDto })
	progress?: UserLibraryProgressResponseDto;

}

export class UserLibraryResponseDto {

	@ApiProperty({ type: [UserLibraryItemResponseDto] })
	itemList!: UserLibraryItemResponseDto[];

	static fromQueryResult(result: UserLibraryItem[]): UserLibraryResponseDto {
		const now = new Date();

		return {
			itemList: result.map(({ license, acquisition, progressSnapshot }) => {
				const classroomGameListing = license.classroomGameListing;

				return {
					classroom: classroomGameListing ? {
						id: classroomGameListing.classroom.id!,
						name: classroomGameListing.classroom.name,
						slug: classroomGameListing.classroom.slug,
					} : undefined,
					classroomGameListingId: classroomGameListing?.id,
					customizationId: license.customization?.id,
					endAt: license.endAt,
					createdAt: license.createdAt!,
					game: {
						id: license.gameVersion.game.id!,
						slug: license.gameVersion.game.slug,
						title: license.gameVersion.game.title,
					},
					gameVersion: {
						id: license.gameVersion.id!,
						publisherVersion: license.gameVersion.publisherVersion,
						runUrl: license.gameVersion.runUrl,
					},
					id: license.id!,
					isActive: license.isActive(),
					language: license.language,
					courseType: license.courseType,
					startAt: license.startAt,
					status: license.isActive(now) ? 'active' : license.startAt > now ? 'scheduled' : 'expired',
					acquisitionMechanism: acquisition?.mechanism ?? 'unknown',
					progress: progressSnapshot ? {
						...progressSnapshot.content,
						schemaVersion: progressSnapshot.schemaVersion,
						updatedAt: progressSnapshot.updatedAt!,
					} : undefined,
				};
			}),
		};
	}

}
