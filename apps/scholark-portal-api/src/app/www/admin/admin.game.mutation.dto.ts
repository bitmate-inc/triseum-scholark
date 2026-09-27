import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsBoolean,
	IsDateString,
	IsOptional,
	IsString,
	IsUUID,
	Matches,
	MaxLength,
	MinLength
} from 'class-validator';

export class CreateAdminGameRequestDto {

	@ApiPropertyOptional({ maxLength: 10000 })
	@IsOptional()
	@IsString()
	@MaxLength(10000)
	description?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	featured?: boolean;

	@ApiPropertyOptional({ format: 'date-time' })
	@IsOptional()
	@IsDateString()
	publishedAt?: string;

	@ApiProperty({ format: 'uuid' })
	@IsUUID()
	publisherId!: string;

	@ApiProperty({ maxLength: 160, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' })
	@IsString()
	@MaxLength(160)
	@Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
	slug!: string;

	@ApiPropertyOptional({ maxLength: 500 })
	@IsOptional()
	@IsString()
	@MaxLength(500)
	summary?: string;

	@ApiProperty({ maxLength: 160, minLength: 1 })
	@IsString()
	@MinLength(1)
	@MaxLength(160)
	@Matches(/\S/)
	title!: string;

}

export class UpdateAdminGameRequestDto {

	@ApiPropertyOptional({ maxLength: 10000 })
	@IsOptional()
	@IsString()
	@MaxLength(10000)
	description?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	featured?: boolean;

	@ApiPropertyOptional({ format: 'date-time', nullable: true })
	@IsOptional()
	@IsDateString()
	publishedAt?: string | null;

	@ApiPropertyOptional({ maxLength: 160, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' })
	@IsOptional()
	@IsString()
	@MaxLength(160)
	@Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
	slug?: string;

	@ApiPropertyOptional({ maxLength: 500 })
	@IsOptional()
	@IsString()
	@MaxLength(500)
	summary?: string;

	@ApiPropertyOptional({ maxLength: 160, minLength: 1 })
	@IsOptional()
	@IsString()
	@MinLength(1)
	@MaxLength(160)
	@Matches(/\S/)
	title?: string;

}