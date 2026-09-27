import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GameLaunchExchangeDto {

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	launchTicket!: string;

}