import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
} from 'class-validator';

import { GetListRequestQueryParamsDto } from '../../../lib/http/request-query.dto';
import {
	GetCatalogClassroomGameListingListFilterByDto,
	GetCatalogClassroomGameListingListQueryResult,
} from '../../core/feature/catalog/query/get.catalog.classroom-game-listing.query';
import { ClassroomGameListing, ClassroomGameListingDesignatedPayor } from '../../core/feature/education/model/classroom.game.listing.entity';
import { GameResponseDto, MoneyDto } from './game.dto';
import { InstitutionResponseDto } from './institution.dto';

export class GetClassroomGameListingListQueryDto extends GetListRequestQueryParamsDto {

	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	institutionId?: string;

	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	classroomId?: string;

	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	gameId?: string;

	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	taxonomyTermId?: string;

	override get filterBy(): GetCatalogClassroomGameListingListFilterByDto {
		return GetCatalogClassroomGameListingListFilterByDto.create({
			...super.filterBy,
			classroomId: this.classroomId,
			gameId: this.gameId,
			institutionId: this.institutionId,
			taxonomyTermId: this.taxonomyTermId,
		});
	}

}

export class RedeemAcquisitionCodeRequestDto {

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	code!: string;

}

export class RedeemAcquisitionCodeResponseDto {

	@ApiProperty({ format: 'uuid' })
	licenseId!: string;

	@ApiProperty({ minimum: 1 })
	licenseDurationDays!: number;

}

class ClassroomGameListingClassroomResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

	@ApiProperty({ type: InstitutionResponseDto })
	institution!: InstitutionResponseDto;

}

export class ClassroomGameListingResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ type: ClassroomGameListingClassroomResponseDto })
	classroom!: ClassroomGameListingClassroomResponseDto;

	@ApiProperty({ type: GameResponseDto })
	game!: GameResponseDto;

	@ApiProperty({ enum: ClassroomGameListingDesignatedPayor, enumName: 'ClassroomGameListingDesignatedPayor' })
	designatedPayor!: ClassroomGameListingDesignatedPayor;

	@ApiProperty({ format: 'uuid' })
	gameVersionId!: string;

	@ApiPropertyOptional({ type: MoneyDto })
	price?: MoneyDto;

	@ApiPropertyOptional({ minimum: 0 })
	includedLicenseQuantity?: number;

	@ApiPropertyOptional({ format: 'uuid' })
	customizationId?: string;

	@ApiProperty()
	language!: string;

	@ApiProperty()
	courseType!: string;

	@ApiProperty({ format: 'date-time', type: String })
	startAt!: Date;

	@ApiProperty({ format: 'date-time', type: String })
	endAt!: Date;

	@ApiProperty({ minimum: 1 })
	licenseDurationDays!: number;

	@ApiProperty({ format: 'date-time', type: String })
	createdAt!: Date;

	@ApiProperty({ format: 'date-time', type: String })
	updatedAt!: Date;

	static fromEntity(classroomGameListing: ClassroomGameListing): ClassroomGameListingResponseDto {
		return {
			classroom: {
				id: classroomGameListing.classroom.id!,
				institution: InstitutionResponseDto.fromEntity(classroomGameListing.classroom.institution),
				name: classroomGameListing.classroom.name,
				slug: classroomGameListing.classroom.slug,
			},
			createdAt: classroomGameListing.createdAt!,
			customizationId: classroomGameListing.customization?.id,
			game: GameResponseDto.fromEntity(classroomGameListing.gameVersion.game),
			designatedPayor: classroomGameListing.designatedPayor,
			gameVersionId: classroomGameListing.gameVersion.id!,
			id: classroomGameListing.id!,
			endAt: classroomGameListing.endAt,
			includedLicenseQuantity: classroomGameListing.includedLicenseQuantity,
			licenseDurationDays: classroomGameListing.licenseDurationDays,
			language: classroomGameListing.language,
			courseType: classroomGameListing.courseType,
			price: classroomGameListing.price,
			startAt: classroomGameListing.startAt,
			updatedAt: classroomGameListing.updatedAt!,
		};
	}

}

export class GetClassroomGameListingResponseDto {

	@ApiProperty({ type: ClassroomGameListingResponseDto })
	classroomGameListing!: ClassroomGameListingResponseDto;

	static fromEntity(classroomGameListing: ClassroomGameListing): GetClassroomGameListingResponseDto {
		return { classroomGameListing: ClassroomGameListingResponseDto.fromEntity(classroomGameListing) };
	}

}

export class GetClassroomGameListingListResponseDto {

	@ApiProperty({ type: [ClassroomGameListingResponseDto] })
	classroomGameListingList!: ClassroomGameListingResponseDto[];

	@ApiProperty({ minimum: 0 })
	totalItemCount!: number;

	static fromQueryResult(result: GetCatalogClassroomGameListingListQueryResult): GetClassroomGameListingListResponseDto {
		return {
			classroomGameListingList: result.classroomGameListingList.map(ClassroomGameListingResponseDto.fromEntity),
			totalItemCount: result.totalItemCount,
		};
	}

}