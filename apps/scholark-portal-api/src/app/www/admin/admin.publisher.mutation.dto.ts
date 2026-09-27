import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsOptional,
	IsString,
	IsUrl,
	Matches,
	MaxLength,
	MinLength,
	ValidateIf
} from 'class-validator';

export class CreateAdminPublisherRequestDto {

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

	@ApiPropertyOptional({ format: 'uri', maxLength: 2048 })
	@IsOptional()
	@ValidateIf((_object, value) => value !== '')
	@IsString()
	@MaxLength(2048)
	@IsUrl({ protocols: ['http', 'https'], require_protocol: true })
	websiteUrl?: string;

}

export class UpdateAdminPublisherRequestDto {

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

	@ApiPropertyOptional({ format: 'uri', maxLength: 2048 })
	@IsOptional()
	@ValidateIf((_object, value) => value !== '')
	@IsString()
	@MaxLength(2048)
	@IsUrl({ protocols: ['http', 'https'], require_protocol: true })
	websiteUrl?: string;

}