import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	ArrayMaxSize,
	IsArray,
	IsDateString,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	IsUrl,
	Matches,
	MaxLength,
	Min,
	ValidateIf,
	ValidateNested,
} from 'class-validator';

import type {
	GameProgressMetricDefinition,
	GameProgressSectionDefinition,
	GameProgressStructure,
} from '../../core/feature/game/model/game.progress.structure';

class AdminGameProgressMetricDefinitionDto implements GameProgressMetricDefinition {

	@ApiProperty({ maxLength: 120 })
	@IsString()
	@IsNotEmpty()
	@MaxLength(120)
	key!: string;

	@ApiProperty({ maxLength: 200 })
	@IsString()
	@IsNotEmpty()
	@MaxLength(200)
	label!: string;

	@ApiPropertyOptional({ minimum: 0.01, type: Number })
	@IsOptional()
	@IsNumber({ allowNaN: false, allowInfinity: false })
	@Min(0.01)
	pointsPossible?: number;

}

class AdminGameProgressSectionDefinitionDto implements GameProgressSectionDefinition {

	@ApiProperty({ maxLength: 200, pattern: '^(0|[1-9]\\d*)(\\.(0|[1-9]\\d*))*$' })
	@IsString()
	@Matches(/^(0|[1-9]\d*)(\.(0|[1-9]\d*))*$/)
	sectionIndex!: string;

	@ApiProperty({ maxLength: 200 })
	@IsString()
	@IsNotEmpty()
	@MaxLength(200)
	label!: string;

	@ApiProperty({ type: [AdminGameProgressMetricDefinitionDto], maxItems: 100 })
	@IsArray()
	@ArrayMaxSize(100)
	@ValidateNested({ each: true })
	@Type(() => AdminGameProgressMetricDefinitionDto)
	metricList!: AdminGameProgressMetricDefinitionDto[];

}

export class AdminGameProgressStructureDto implements GameProgressStructure {

	@ApiProperty({ minimum: 1 })
	@IsInt()
	@Min(1)
	schemaVersion!: number;

	@ApiProperty({ type: [AdminGameProgressSectionDefinitionDto], maxItems: 1000 })
	@IsArray()
	@ArrayMaxSize(1000)
	@ValidateNested({ each: true })
	@Type(() => AdminGameProgressSectionDefinitionDto)
	sectionList!: AdminGameProgressSectionDefinitionDto[];

}

export class CreateAdminGameVersionRequestDto {

	@ApiProperty({ maxLength: 120 })
	@IsString()
	@IsNotEmpty()
	@MaxLength(120)
	publisherVersion!: string;

	@ApiPropertyOptional({ maxLength: 10000 })
	@IsOptional()
	@IsString()
	@MaxLength(10000)
	description?: string;

	@ApiProperty({ format: 'uri' })
	@IsUrl({ protocols: ['http', 'https'], require_protocol: true })
	runUrl!: string;

	@ApiPropertyOptional({ type: AdminGameProgressStructureDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => AdminGameProgressStructureDto)
	progressStructure?: AdminGameProgressStructureDto;

	@ApiPropertyOptional({ format: 'date-time' })
	@IsOptional()
	@IsDateString()
	publishedAt?: string;

}

export class UpdateAdminGameVersionRequestDto {

	@ApiPropertyOptional({ maxLength: 120 })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(120)
	publisherVersion?: string;

	@ApiPropertyOptional({ maxLength: 10000 })
	@IsOptional()
	@IsString()
	@MaxLength(10000)
	description?: string;

	@ApiPropertyOptional({ format: 'uri' })
	@IsOptional()
	@IsUrl({ protocols: ['http', 'https'], require_protocol: true })
	runUrl?: string;

	@ApiPropertyOptional({ type: AdminGameProgressStructureDto, nullable: true })
	@ValidateIf((_object, value) => value !== null && value !== undefined)
	@ValidateNested()
	@Type(() => AdminGameProgressStructureDto)
	progressStructure?: AdminGameProgressStructureDto | null;

	@ApiPropertyOptional({ format: 'date-time', nullable: true })
	@IsOptional()
	@IsDateString()
	publishedAt?: string | null;

}