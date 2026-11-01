import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class LinkAdminPublisherMemberRequestDto {

	@ApiProperty({ format: 'email' })
	@IsEmail()
	email!: string;

}

export class LinkAdminPublisherMemberResponseDto {

	@ApiProperty()
	message!: string;

}