import { ApiProperty } from '@nestjs/swagger';
import {
	IsDateString,
	IsInt,
	IsString,
	IsUUID,
	Matches,
	Max,
	MaxLength,
	Min
} from 'class-validator';

export class CreateAdminAcquisitionCodesRequestDto {

	@ApiProperty({ format: 'uuid' })
	@IsUUID()
	classroomGameId!: string;

	@ApiProperty({ minimum: 1, maximum: 500 })
	@IsInt()
	@Min(1)
	@Max(500)
	quantity!: number;

	@ApiProperty({ format: 'date-time' })
	@IsDateString()
	expiresAt!: string;

}

export class RevokeAdminAcquisitionCodeRequestDto {

	@ApiProperty({ minLength: 1, maxLength: 1000 })
	@Matches(/\S/)
	@IsString()
	@MaxLength(1000)
	reason!: string;

}