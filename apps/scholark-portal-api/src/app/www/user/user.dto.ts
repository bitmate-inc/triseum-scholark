import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator';

import { GamePaymentAttempt, GamePaymentAttemptStatus } from '../../core/feature/game/model/game.payment.attempt.entity';

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

	@ApiPropertyOptional({ type: String, format: 'uri' })
	checkoutUrl?: string;

}

export class UserPaymentAttemptResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	gameTitle!: string;

	@ApiProperty({ type: Object })
	price!: { currency: string; minorUnitAmount: number };

	@ApiProperty({ enum: GamePaymentAttemptStatus, enumName: 'GamePaymentAttemptStatus' })
	status!: GamePaymentAttemptStatus;

	@ApiProperty({ type: String, format: 'date-time' })
	createdAt!: Date;

	@ApiPropertyOptional({ type: String, format: 'date-time' })
	fulfilledAt?: Date;

	@ApiProperty()
	canRevalidate!: boolean;

	static fromEntity(attempt: GamePaymentAttempt): UserPaymentAttemptResponseDto {
		return {
			canRevalidate: attempt.status === GamePaymentAttemptStatus.PENDING && Boolean(attempt.stripeCheckoutSessionId),
			createdAt: attempt.createdAt!,
			fulfilledAt: attempt.fulfilledAt,
			gameTitle: attempt.publicOffer?.gameVariant.gameVersion.game.title
				?? attempt.institutionGameOffer?.gameVariant.gameVersion.game.title
				?? attempt.classroomGame?.institutionGameOffer.gameVariant.gameVersion.game.title
				?? 'Unknown game',
			id: attempt.id!,
			price: attempt.price,
			status: attempt.status,
		};
	}

}

export class UserPaymentAttemptListResponseDto {

	@ApiProperty({ type: [UserPaymentAttemptResponseDto] })
	itemList!: UserPaymentAttemptResponseDto[];

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