import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class LinkAdminInstructorAccountRequestDto {

	@ApiProperty({ format: 'email' })
	@IsEmail()
	email!: string;

}

export class CreateAdminInstructorInvitationResponseDto {

	@ApiProperty()
	message!: string;

	@ApiProperty({ format: 'date-time' })
	expiresAt!: Date;

	@ApiPropertyOptional({ format: 'uri' })
	invitationUrl?: string;

}