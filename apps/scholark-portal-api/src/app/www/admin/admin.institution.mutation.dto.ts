import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsEnum,
	IsOptional,
	IsString,
	IsUrl,
	Matches,
	MaxLength,
	MinLength
} from 'class-validator';

import { EducationCatalogStatus } from '../../core/feature/education/model/education.catalog.status';

export class CreateAdminInstitutionRequestDto {

	@ApiPropertyOptional({ maxLength: 10000 })
	@IsOptional()
	@IsString()
	@MaxLength(10000)
	description?: string;

	@ApiProperty({ maxLength: 160, minLength: 1 })
	@IsString()
	@MinLength(1)
	@MaxLength(160)
	@Matches(/\S/)
	name!: string;

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

	@ApiPropertyOptional({ maxLength: 2048, format: 'uri' })
	@IsOptional()
	@IsUrl({ require_protocol: true })
	@MaxLength(2048)
	websiteUrl?: string;

}

export class UpdateAdminInstitutionRequestDto {

	@ApiPropertyOptional({ maxLength: 10000 })
	@IsOptional()
	@IsString()
	@MaxLength(10000)
	description?: string;

	@ApiPropertyOptional({ maxLength: 160, minLength: 1 })
	@IsOptional()
	@IsString()
	@MinLength(1)
	@MaxLength(160)
	@Matches(/\S/)
	name?: string;

	@ApiPropertyOptional({ maxLength: 160, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' })
	@IsOptional()
	@IsString()
	@MaxLength(160)
	@Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
	slug?: string;

	@ApiPropertyOptional({ enum: EducationCatalogStatus, enumName: 'EducationCatalogStatus' })
	@IsOptional()
	@IsEnum(EducationCatalogStatus)
	status?: EducationCatalogStatus;

	@ApiPropertyOptional({ maxLength: 500 })
	@IsOptional()
	@IsString()
	@MaxLength(500)
	summary?: string;

	@ApiPropertyOptional({ maxLength: 2048, format: 'uri' })
	@IsOptional()
	@IsUrl({ require_protocol: true })
	@MaxLength(2048)
	websiteUrl?: string;

}