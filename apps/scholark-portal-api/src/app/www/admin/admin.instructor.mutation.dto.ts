import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	ArrayUnique,
	IsArray,
	IsOptional,
	IsString,
	IsUUID,
	Matches,
	MaxLength,
	MinLength
} from 'class-validator';

export class CreateAdminInstructorRequestDto {

	@ApiPropertyOptional({ type: [String], format: 'uuid' })
	@IsOptional()
	@IsArray()
	@ArrayUnique()
	@IsUUID('4', { each: true })
	classroomIdList?: string[];

	@ApiPropertyOptional({ type: [String], format: 'uuid' })
	@IsOptional()
	@IsArray()
	@ArrayUnique()
	@IsUUID('4', { each: true })
	institutionIdList?: string[];

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

}

export class UpdateAdminInstructorRequestDto {

	@ApiPropertyOptional({ type: [String], format: 'uuid' })
	@IsOptional()
	@IsArray()
	@ArrayUnique()
	@IsUUID('4', { each: true })
	classroomIdList?: string[];

	@ApiPropertyOptional({ type: [String], format: 'uuid' })
	@IsOptional()
	@IsArray()
	@ArrayUnique()
	@IsUUID('4', { each: true })
	institutionIdList?: string[];

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

}