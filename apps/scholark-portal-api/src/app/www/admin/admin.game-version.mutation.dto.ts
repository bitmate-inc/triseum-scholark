import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsDateString,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUrl,
	MaxLength,
} from 'class-validator';


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

}