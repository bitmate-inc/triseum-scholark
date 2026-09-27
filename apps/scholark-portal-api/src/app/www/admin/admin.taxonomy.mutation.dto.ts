import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsEnum,
	IsOptional,
	IsString,
	Matches,
	MaxLength,
	MinLength
} from 'class-validator';

import { TaxonomyType } from '../../core/feature/taxonomy/model/taxonomy.term.entity';

export class CreateAdminTaxonomyTermRequestDto {

	@ApiProperty({ maxLength: 160, minLength: 1 })
	@IsString()
	@MinLength(1)
	@MaxLength(160)
	@Matches(/\S/)
	label!: string;

	@ApiProperty({ maxLength: 160, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' })
	@IsString()
	@MaxLength(160)
	@Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
	slug!: string;

	@ApiProperty({ enum: TaxonomyType, enumName: 'TaxonomyType' })
	@IsEnum(TaxonomyType)
	type!: TaxonomyType;

}

export class UpdateAdminTaxonomyTermRequestDto {

	@ApiPropertyOptional({ maxLength: 160, minLength: 1 })
	@IsOptional()
	@IsString()
	@MinLength(1)
	@MaxLength(160)
	@Matches(/\S/)
	label?: string;

	@ApiPropertyOptional({ maxLength: 160, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' })
	@IsOptional()
	@IsString()
	@MaxLength(160)
	@Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
	slug?: string;

	@ApiPropertyOptional({ enum: TaxonomyType, enumName: 'TaxonomyType' })
	@IsOptional()
	@IsEnum(TaxonomyType)
	type?: TaxonomyType;

}