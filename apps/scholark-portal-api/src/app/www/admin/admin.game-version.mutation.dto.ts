import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	ArrayMinSize,
	IsDateString,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUrl,
	IsUUID,
	MaxLength,
	ValidateNested,
} from 'class-validator';

import type { CreateAdminGameVersionCommandData } from '../../core/feature/admin/command/create.admin.game.version.command';
import type { UpdateAdminGameVersionCommandData } from '../../core/feature/admin/command/update.admin.game.version.command';
import { GameVariantMode } from '../../core/feature/game/model/game.variant.entity';

class CreateAdminGameVariantRequestDto {

	@ApiProperty({ maxLength: 32 })
	@IsString()
	@IsNotEmpty()
	@MaxLength(32)
	language!: string;

	@ApiProperty({ enum: GameVariantMode })
	@IsEnum(GameVariantMode)
	mode!: GameVariantMode;

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

	@ApiPropertyOptional({ format: 'date-time' })
	@IsOptional()
	@IsDateString()
	publishedAt?: string;

	@ApiProperty({ type: [CreateAdminGameVariantRequestDto], minItems: 1 })
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => CreateAdminGameVariantRequestDto)
	variantList!: CreateAdminGameVersionCommandData['variantList'];

}

class UpdateAdminGameVariantRequestDto {

	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	id?: string;

	@ApiProperty({ maxLength: 32 })
	@IsString()
	@IsNotEmpty()
	@MaxLength(32)
	language!: string;

	@ApiProperty({ enum: GameVariantMode })
	@IsEnum(GameVariantMode)
	mode!: GameVariantMode;

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

	@ApiPropertyOptional({ format: 'date-time', nullable: true })
	@IsOptional()
	@IsDateString()
	publishedAt?: string | null;

	@ApiPropertyOptional({ type: [UpdateAdminGameVariantRequestDto], minItems: 1 })
	@IsOptional()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => UpdateAdminGameVariantRequestDto)
	variantList?: UpdateAdminGameVersionCommandData['variantList'];

}