import { ApiProperty } from '@nestjs/swagger';
import {
	IsDateString,
	IsInt,
	IsObject,
	IsString,
	MaxLength,
	Min,
} from 'class-validator';

export class GamePlayEventDto {

	@ApiProperty({ maxLength: 200 })
	@IsString()
	@MaxLength(200)
	eventId!: string;

	@ApiProperty({ maxLength: 200 })
	@IsString()
	@MaxLength(200)
	eventType!: string;

	@ApiProperty({ minimum: 1 })
	@IsInt()
	@Min(1)
	schemaVersion!: number;

	@ApiProperty({ type: Object })
	@IsObject()
	payload!: Record<string, unknown>;

	@ApiProperty({ format: 'date-time' })
	@IsDateString()
	occurredAt!: string;

}

export class GameStateDto {

	@ApiProperty({ minimum: 1 })
	@IsInt()
	@Min(1)
	schemaVersion!: number;

	@ApiProperty({ type: Object })
	@IsObject()
	state!: Record<string, unknown>;

}
