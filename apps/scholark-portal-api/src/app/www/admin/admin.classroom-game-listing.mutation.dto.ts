import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsDateString,
	IsEnum,
	IsInt,
	IsOptional,
	IsUUID,
	Min,
	ValidateNested,
} from 'class-validator';

import { ClassroomGameListingDesignatedPayor } from '../../core/feature/education/model/classroom.game.listing.entity';
import { AdminGameListingPriceRequestDto } from './admin.game-listing.mutation.dto';

export class CreateAdminClassroomGameListingRequestDto {

	@ApiProperty({ format: 'uuid' })
	@IsUUID()
	classroomId!: string;

	@ApiProperty({ format: 'uuid' })
	@IsUUID()
	gameVariantId!: string;

	@ApiProperty({ enum: ClassroomGameListingDesignatedPayor })
	@IsEnum(ClassroomGameListingDesignatedPayor)
	designatedPayor!: ClassroomGameListingDesignatedPayor;

	@ApiPropertyOptional({ type: AdminGameListingPriceRequestDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => AdminGameListingPriceRequestDto)
	price?: AdminGameListingPriceRequestDto;

	@ApiPropertyOptional({ minimum: 0 })
	@IsOptional()
	@IsInt()
	@Min(0)
	includedLicenseQuantity?: number;

	@ApiProperty({ minimum: 1 })
	@IsInt()
	@Min(1)
	licenseDurationDays!: number;

	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	customizationId?: string;

	@ApiProperty({ format: 'date-time' })
	@IsDateString()
	startAt!: string;

	@ApiProperty({ format: 'date-time' })
	@IsDateString()
	endAt!: string;

	@ApiPropertyOptional({ format: 'date-time' })
	@IsOptional()
	@IsDateString()
	publishedAt?: string;

}

export class UpdateAdminClassroomGameListingRequestDto {

	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	classroomId?: string;

	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	gameVariantId?: string;

	@ApiPropertyOptional({ enum: ClassroomGameListingDesignatedPayor })
	@IsOptional()
	@IsEnum(ClassroomGameListingDesignatedPayor)
	designatedPayor?: ClassroomGameListingDesignatedPayor;

	@ApiPropertyOptional({ type: AdminGameListingPriceRequestDto, nullable: true })
	@IsOptional()
	@ValidateNested()
	@Type(() => AdminGameListingPriceRequestDto)
	price?: AdminGameListingPriceRequestDto | null;

	@ApiPropertyOptional({ minimum: 0, nullable: true })
	@IsOptional()
	@IsInt()
	@Min(0)
	includedLicenseQuantity?: number | null;

	@ApiPropertyOptional({ minimum: 1 })
	@IsOptional()
	@IsInt()
	@Min(1)
	licenseDurationDays?: number;

	@ApiPropertyOptional({ format: 'uuid', nullable: true })
	@IsOptional()
	@IsUUID()
	customizationId?: string | null;

	@ApiPropertyOptional({ format: 'date-time' })
	@IsOptional()
	@IsDateString()
	startAt?: string;

	@ApiPropertyOptional({ format: 'date-time' })
	@IsOptional()
	@IsDateString()
	endAt?: string;

	@ApiPropertyOptional({ format: 'date-time', nullable: true })
	@IsOptional()
	@IsDateString()
	publishedAt?: string | null;

}