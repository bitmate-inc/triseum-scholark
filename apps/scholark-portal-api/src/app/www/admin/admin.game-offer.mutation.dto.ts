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

import { InstitutionGameOfferDesignatedPayor } from '../../core/feature/education/model/institution.game.offer.entity';
import { Currency } from '../../core/shared/commerce/model/currency';

class AdminGameOfferPriceRequestDto {

	@ApiProperty({ minimum: 0 })
	@IsInt()
	@Min(0)
	minorUnitAmount!: number;

	@ApiProperty({ enum: Currency })
	@IsEnum(Currency)
	currency!: Currency;

}

export class CreateAdminPublicGameOfferRequestDto {

	@ApiProperty({ format: 'uuid' })
	@IsUUID()
	gameVariantId!: string;

	@ApiProperty({ type: AdminGameOfferPriceRequestDto })
	@ValidateNested()
	@Type(() => AdminGameOfferPriceRequestDto)
	price!: AdminGameOfferPriceRequestDto;

	@ApiProperty()
	@IsBoolean()
	available!: boolean;

	@ApiPropertyOptional({ format: 'date-time' })
	@IsOptional()
	@IsDateString()
	publishedAt?: string;

}

export class CreateAdminInstitutionGameOfferRequestDto {

	@ApiProperty({ format: 'uuid' })
	@IsUUID()
	gameVariantId!: string;

	@ApiProperty({ type: AdminGameOfferPriceRequestDto })
	@ValidateNested()
	@Type(() => AdminGameOfferPriceRequestDto)
	price!: AdminGameOfferPriceRequestDto;

	@ApiProperty({ enum: InstitutionGameOfferDesignatedPayor })
	@IsEnum(InstitutionGameOfferDesignatedPayor)
	designatedPayor!: InstitutionGameOfferDesignatedPayor;

	@ApiProperty({ minimum: 1 })
	@IsInt()
	@Min(1)
	licenseDurationDays!: number;

	@ApiPropertyOptional({ minimum: 0 })
	@IsOptional()
	@IsInt()
	@Min(0)
	allocatedLicenseQuantity?: number;

	@ApiPropertyOptional({ format: 'date-time' })
	@IsOptional()
	@IsDateString()
	publishedAt?: string;

}

export class UpdateAdminInstitutionGameOfferRequestDto {

	@ApiPropertyOptional({ type: AdminGameOfferPriceRequestDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => AdminGameOfferPriceRequestDto)
	price?: AdminGameOfferPriceRequestDto;

	@ApiPropertyOptional({ enum: InstitutionGameOfferDesignatedPayor })
	@IsOptional()
	@IsEnum(InstitutionGameOfferDesignatedPayor)
	designatedPayor?: InstitutionGameOfferDesignatedPayor;

	@ApiPropertyOptional({ minimum: 1 })
	@IsOptional()
	@IsInt()
	@Min(1)
	licenseDurationDays?: number;

	@ApiPropertyOptional({ minimum: 0, nullable: true })
	@IsOptional()
	@IsInt()
	@Min(0)
	allocatedLicenseQuantity?: number | null;

	@ApiPropertyOptional({ format: 'date-time', nullable: true })
	@IsOptional()
	@IsDateString()
	publishedAt?: string | null;

}

export class UpdateAdminPublicGameOfferRequestDto {

	@ApiPropertyOptional({ type: AdminGameOfferPriceRequestDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => AdminGameOfferPriceRequestDto)
	price?: AdminGameOfferPriceRequestDto;

	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	available?: boolean;

	@ApiPropertyOptional({ format: 'date-time', nullable: true })
	@IsOptional()
	@IsDateString()
	publishedAt?: string | null;

}