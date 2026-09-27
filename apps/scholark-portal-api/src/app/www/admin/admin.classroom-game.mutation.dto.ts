import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsDateString,
	IsOptional,
	IsUUID
} from 'class-validator';

export class CreateAdminClassroomGameRequestDto {

	@ApiProperty({ format: 'uuid' })
	@IsUUID()
	classroomId!: string;

	@ApiProperty({ format: 'uuid' })
	@IsUUID()
	institutionGameOfferId!: string;

	@ApiProperty({ format: 'date-time' })
	@IsDateString()
	startAt!: string;

	@ApiProperty({ format: 'date-time' })
	@IsDateString()
	endAt!: string;

	@ApiPropertyOptional({ format: 'date-time' })
	@IsOptional()
	@IsDateString()
	publishedAt?: string;

}

export class UpdateAdminClassroomGameRequestDto {

	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	classroomId?: string;

	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	institutionGameOfferId?: string;

	@ApiPropertyOptional({ format: 'date-time' })
	@IsOptional()
	@IsDateString()
	startAt?: string;

	@ApiPropertyOptional({ format: 'date-time' })
	@IsOptional()
	@IsDateString()
	endAt?: string;

	@ApiPropertyOptional({ format: 'date-time', nullable: true })
	@IsOptional()
	@IsDateString()
	publishedAt?: string | null;

}