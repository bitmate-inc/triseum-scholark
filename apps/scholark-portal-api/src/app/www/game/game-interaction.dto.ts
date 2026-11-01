import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	ArrayMaxSize,
	IsArray,
	IsBoolean,
	IsDateString,
	IsInt,
	IsNumber,
	IsObject,
	IsOptional,
	IsString,
	Matches,
	Max,
	MaxLength,
	Min,
	ValidateIf,
	ValidateNested,
} from 'class-validator';

import type {
	GameProgressMetricMap,
	GameProgressSection,
	GameProgressSummary,
} from '../../core/feature/game/model/game.progress.snapshot.entity';

export class GamePlayEventDto {

	@ApiProperty({ maxLength: 200 })
	@IsString()
	@MaxLength(200)
	eventId!: string;

	@ApiProperty({ maxLength: 200 })
	@IsString()
	@MaxLength(200)
	eventType!: string;

	@ApiProperty({ minimum: 1 })
	@IsInt()
	@Min(1)
	schemaVersion!: number;

	@ApiProperty({ type: Object })
	@IsObject()
	payload!: Record<string, unknown>;

	@ApiProperty({ format: 'date-time' })
	@IsDateString()
	occurredAt!: string;

}

export class GameStateDto {

	@ApiProperty({ minimum: 1 })
	@IsInt()
	@Min(1)
	schemaVersion!: number;

	@ApiProperty({ type: Object })
	@IsObject()
	state!: Record<string, unknown>;

}

export class GameProgressSummaryDto implements GameProgressSummary {

	@ApiPropertyOptional({ minimum: 0, type: Number, nullable: true })
	@IsOptional()
	@IsNumber({ allowNaN: false, allowInfinity: false })
	@Min(0)
	playTimeSeconds?: number | null;

	@ApiPropertyOptional({ minimum: 0, nullable: true })
	@IsOptional()
	@IsInt()
	@Min(0)
	sessionCount?: number | null;

	@ApiPropertyOptional({ minimum: 0, maximum: 100, type: Number, nullable: true })
	@IsOptional()
	@IsNumber({ allowNaN: false, allowInfinity: false })
	@Min(0)
	@Max(100)
	completionPercent?: number | null;

	@ApiPropertyOptional({ nullable: true })
	@IsOptional()
	@IsBoolean()
	completed?: boolean | null;

	@ApiPropertyOptional({ type: Object, nullable: true })
	@IsOptional()
	@IsObject()
	metrics?: GameProgressMetricMap | null;

}

export class GameProgressSectionDto implements GameProgressSection {

	@ApiProperty({ maxLength: 200, pattern: '^(0|[1-9]\\d*)(\\.(0|[1-9]\\d*))*$' })
	@IsString()
	@Matches(/^(0|[1-9]\d*)(\.(0|[1-9]\d*))*$/)
	@MaxLength(200)
	sectionIndex!: string;

	@ApiPropertyOptional({ minimum: 0, maximum: 100, type: Number, nullable: true })
	@IsOptional()
	@IsNumber({ allowNaN: false, allowInfinity: false })
	@Min(0)
	@Max(100)
	completionPercent?: number | null;

	@ApiPropertyOptional({ nullable: true })
	@IsOptional()
	@IsBoolean()
	completed?: boolean | null;

	@ApiPropertyOptional({ type: Object, nullable: true })
	@IsOptional()
	@IsObject()
	metrics?: GameProgressMetricMap | null;

}

export class GameProgressSnapshotDto {

	@ApiProperty({ minimum: 1 })
	@IsInt()
	@Min(1)
	schemaVersion!: number;

	@ApiPropertyOptional({ type: GameProgressSummaryDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => GameProgressSummaryDto)
	summary?: GameProgressSummaryDto | null;

	@ApiPropertyOptional({ type: [GameProgressSectionDto], maxItems: 1000 })
	@ValidateIf((_object, value) => value !== undefined)
	@IsArray()
	@ArrayMaxSize(1000)
	@ValidateNested({ each: true })
	@Type(() => GameProgressSectionDto)
	sectionList?: GameProgressSectionDto[];

}
