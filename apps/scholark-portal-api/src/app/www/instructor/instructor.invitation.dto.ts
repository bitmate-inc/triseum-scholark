import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator';

import type { AcceptInstructorInvitationResult } from '../../core/feature/education/command/accept.instructor.invitation.command';
import type { GetInstructorInvitationResult } from '../../core/feature/education/query/get.instructor.invitation.query';

export class InstructorInvitationResponseDto {

	@ApiProperty()
	accountExists!: boolean;

	@ApiProperty({ format: 'email' })
	email!: string;

	@ApiProperty({ format: 'date-time' })
	expiresAt!: Date;

	@ApiProperty()
	instructorName!: string;

	static fromQueryResult(result: GetInstructorInvitationResult): InstructorInvitationResponseDto {
		return {
			accountExists: result.accountExists,
			email: result.email,
			expiresAt: result.expiresAt,
			instructorName: result.instructorName,
		};
	}

}

export class AcceptInstructorInvitationRequestDto {

	@ApiPropertyOptional({ maxLength: 100 })
	@IsOptional()
	@IsString()
	@MaxLength(100)
	firstName?: string;

	@ApiPropertyOptional({ maxLength: 100 })
	@IsOptional()
	@IsString()
	@MaxLength(100)
	lastName?: string;

	@ApiPropertyOptional({ minLength: 8, maxLength: 128 })
	@IsOptional()
	@IsString()
	@MinLength(8)
	@MaxLength(128)
	password?: string;

	@ApiProperty({ minLength: 1 })
	@IsNotEmpty()
	@IsString()
	token!: string;

}

export class AcceptInstructorInvitationResponseDto {

	@ApiProperty()
	accountCreated!: boolean;

	@ApiProperty({ format: 'email' })
	email!: string;

	@ApiProperty()
	instructorName!: string;

	@ApiProperty()
	message!: string;

	static fromResult(result: AcceptInstructorInvitationResult): AcceptInstructorInvitationResponseDto {
		return {
			accountCreated: result.accountCreated,
			email: result.email,
			instructorName: result.instructorName,
			message: result.accountCreated ? 'Account created and instructor access activated.' : 'Instructor access activated.',
		};
	}

}