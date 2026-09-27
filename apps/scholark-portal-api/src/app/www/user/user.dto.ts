import { ApiProperty } from '@nestjs/swagger';
import {
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator';

export class UpdateProfileRequestDto {

	@ApiProperty({ maxLength: 100 })
	@IsString()
	@MaxLength(100)
	firstName!: string;

	@ApiProperty({ maxLength: 100 })
	@IsString()
	@MaxLength(100)
	lastName!: string;

}

export class ChangePasswordRequestDto {

	@ApiProperty()
	@IsString()
	currentPassword!: string;

	@ApiProperty({ minLength: 8 })
	@IsString()
	@MaxLength(128)
	@MinLength(8)
	password!: string;

}

export class GameCheckoutStatusResponseDto {

	@ApiProperty({ enum: ['pending', 'fulfilled', 'failed'] })
	status!: 'pending' | 'fulfilled' | 'failed';

}

export class GameLaunchResponseDto {

	@ApiProperty({ format: 'uuid' })
	licenseId!: string;

	@ApiProperty({ format: 'uri' })
	launchUrl!: string;

	@ApiProperty()
	launchTicket!: string;

	@ApiProperty({ format: 'uuid' })
	gameVersionId!: string;

	@ApiProperty({ minimum: 1, maximum: 120 })
	validForSeconds!: number;

}