import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsBoolean,
	IsDateString,
	IsEnum,
	IsInt,
	IsOptional,
	IsUUID,
	Min,
	ValidateNested,
} from 'class-validator';

import { Currency } from '../../core/shared/commerce/model/currency';

export class AdminGameListingPriceRequestDto {

	@ApiProperty({ minimum: 0 })
	@IsInt()
	@Min(0)
	minorUnitAmount!: number;

	@ApiProperty({ enum: Currency })
	@IsEnum(Currency)
	currency!: Currency;

}

export class CreateAdminPublicGameListingRequestDto {

	@ApiProperty({ format: 'uuid' })
	@IsUUID()
	gameVariantId!: string;

	@ApiProperty({ type: AdminGameListingPriceRequestDto })
	@ValidateNested()
	@Type(() => AdminGameListingPriceRequestDto)
	price!: AdminGameListingPriceRequestDto;

	@ApiProperty()
	@IsBoolean()
	available!: boolean;

	@ApiPropertyOptional({ format: 'date-time' })
	@IsOptional()
	@IsDateString()
	publishedAt?: string;

}

export class UpdateAdminPublicGameListingRequestDto {

	@ApiPropertyOptional({ type: AdminGameListingPriceRequestDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => AdminGameListingPriceRequestDto)
	price?: AdminGameListingPriceRequestDto;

	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	available?: boolean;

	@ApiPropertyOptional({ format: 'date-time', nullable: true })
	@IsOptional()
	@IsDateString()
	publishedAt?: string | null;

}