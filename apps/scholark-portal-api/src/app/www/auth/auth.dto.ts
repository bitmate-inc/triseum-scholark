import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsEmail,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator';

import { User } from '../../core/feature/user/model/user.entity';

export class EmailRequestDto {

	@ApiProperty({ example: 'user@example.com' })
	@IsEmail()
	email!: string;

}

export class LoginRequestDto extends EmailRequestDto {

	@ApiProperty({ minLength: 8 })
	@IsString()
	@MaxLength(128)
	@MinLength(8)
	password!: string;

}

export class RegisterRequestDto extends LoginRequestDto {

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

}

export class TokenRequestDto {

	@ApiProperty()
	@IsString()
	@MinLength(32)
	token!: string;

}

export class ResetPasswordRequestDto extends TokenRequestDto {

	@ApiProperty({ minLength: 8 })
	@IsString()
	@MaxLength(128)
	@MinLength(8)
	password!: string;

}

export class MessageResponseDto {

	@ApiProperty()
	message!: string;

}

export class UserResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ format: 'email' })
	email!: string;

	@ApiPropertyOptional({ nullable: true })
	firstName?: string;

	@ApiPropertyOptional({ nullable: true })
	lastName?: string;

	static fromEntity(user: User): UserResponseDto {
		return {
			email: user.email,
			firstName: user.firstName,
			id: user.id!,
			lastName: user.lastName,
		};
	}

}