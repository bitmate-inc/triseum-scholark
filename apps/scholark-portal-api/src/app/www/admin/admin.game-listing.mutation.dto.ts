import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	ArrayMinSize,
	IsArray,
	IsBoolean,
	IsDateString,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
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

export class AdminGameListingPriceGroupRequestDto {

	@ApiProperty({ type: [String], minItems: 1 })
	@IsArray()
	@ArrayMinSize(1)
	@IsString({ each: true })
	@IsNotEmpty({ each: true })
	languageList!: string[];

	@ApiProperty({ type: AdminGameListingPriceRequestDto })
	@ValidateNested()
	@Type(() => AdminGameListingPriceRequestDto)
	price!: AdminGameListingPriceRequestDto;

}

export class CreateAdminPublicGameListingRequestDto {

	@ApiProperty({ format: 'uuid' })
	@IsUUID()
	gameVersionId!: string;

	@ApiProperty({ type: [AdminGameListingPriceGroupRequestDto], minItems: 1 })
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => AdminGameListingPriceGroupRequestDto)
	priceGroupList!: AdminGameListingPriceGroupRequestDto[];

	@ApiProperty()
	@IsBoolean()
	available!: boolean;

	@ApiPropertyOptional({ format: 'date-time' })
	@IsOptional()
	@IsDateString()
	startAt?: string;

	@ApiPropertyOptional({ format: 'date-time' })
	@IsOptional()
	@IsDateString()
	endAt?: string;

	@ApiPropertyOptional({ format: 'date-time' })
	@IsOptional()
	@IsDateString()
	publishedAt?: string;

}

export class UpdateAdminPublicGameListingRequestDto {

	@ApiPropertyOptional({ type: [AdminGameListingPriceGroupRequestDto], minItems: 1 })
	@IsOptional()
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => AdminGameListingPriceGroupRequestDto)
	priceGroupList?: AdminGameListingPriceGroupRequestDto[];

	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	available?: boolean;

	@ApiPropertyOptional({ format: 'date-time' })
	@IsOptional()
	@IsDateString()
	startAt?: string;

	@ApiPropertyOptional({ format: 'date-time', nullable: true })
	@IsOptional()
	@IsDateString()
	endAt?: string | null;

	@ApiPropertyOptional({ format: 'date-time', nullable: true })
	@IsOptional()
	@IsDateString()
	publishedAt?: string | null;

}