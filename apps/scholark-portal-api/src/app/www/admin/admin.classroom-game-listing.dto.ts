import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

import { GetListRequestQueryParamsDto } from '../../../lib/http/request-query.dto';
import type { GetAdminClassroomGameListingListQueryData } from '../../core/feature/admin/query/get.admin.classroom.game.listing.query';
import { ClassroomGameListing, ClassroomGameListingDesignatedPayor } from '../../core/feature/education/model/classroom.game.listing.entity';
import { MoneyDto } from '../catalog/game.dto';

export class GetAdminClassroomGameListingListQueryDto extends GetListRequestQueryParamsDto {

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

	get adminFilterBy(): GetAdminClassroomGameListingListQueryData['filterBy'] {
		return {
			classroomId: this.classroomId,
			gameId: this.gameId,
			institutionId: this.institutionId,
			q: this.q,
		};
	}

}

class AdminClassroomGameListingInstitutionResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

}

class AdminClassroomGameListingPublisherResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

}

export class AdminClassroomGameListingResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ type: () => AdminClassroomGameListingInstitutionResponseDto })
	institution!: AdminClassroomGameListingInstitutionResponseDto;

	@ApiProperty({ format: 'uuid' })
	classroomId!: string;

	@ApiProperty()
	classroomName!: string;

	@ApiProperty()
	classroomSlug!: string;

	@ApiProperty({ format: 'uuid' })
	gameId!: string;

	@ApiProperty()
	gameTitle!: string;

	@ApiProperty()
	gameSlug!: string;

	@ApiProperty({ type: () => AdminClassroomGameListingPublisherResponseDto })
	publisher!: AdminClassroomGameListingPublisherResponseDto;

	@ApiProperty({ format: 'uuid' })
	gameVersionId!: string;

	@ApiProperty()
	publisherVersion!: string;

	@ApiProperty({ enum: ClassroomGameListingDesignatedPayor, enumName: 'ClassroomGameListingDesignatedPayor' })
	designatedPayor!: ClassroomGameListingDesignatedPayor;

	@ApiPropertyOptional({ type: MoneyDto })
	price?: MoneyDto;

	@ApiPropertyOptional({ minimum: 0 })
	includedLicenseQuantity?: number;

	@ApiPropertyOptional({ format: 'uuid' })
	customizationId?: string;

	@ApiPropertyOptional({ format: 'date-time', type: String })
	customizationCreatedAt?: Date;

	@ApiPropertyOptional({ format: 'date-time', type: String })
	customizationPublishedAt?: Date;

	@ApiProperty()
	licenseDurationDays!: number;

	@ApiProperty()
	language!: string;

	@ApiProperty()
	courseType!: string;

	@ApiProperty({ format: 'date-time', type: String })
	startAt!: Date;

	@ApiProperty({ format: 'date-time', type: String })
	endAt!: Date;

	@ApiPropertyOptional({ format: 'date-time', type: String })
	publishedAt?: Date;

	@ApiPropertyOptional({ format: 'date-time', type: String })
	gamePublishedAt?: Date;

	static fromEntity(classroomGameListing: ClassroomGameListing): AdminClassroomGameListingResponseDto {
		const game = classroomGameListing.gameVersion.game;
		return {
			classroomId: classroomGameListing.classroom.id!,
			classroomName: classroomGameListing.classroom.name,
			classroomSlug: classroomGameListing.classroom.slug,
			designatedPayor: classroomGameListing.designatedPayor,
			endAt: classroomGameListing.endAt,
			gameId: game.id!,
			gamePublishedAt: game.publishedAt,
			gameSlug: game.slug,
			gameTitle: game.title,
			gameVersionId: classroomGameListing.gameVersion.id!,
			id: classroomGameListing.id!,
			institution: {
				id: classroomGameListing.classroom.institution.id!,
				name: classroomGameListing.classroom.institution.name,
				slug: classroomGameListing.classroom.institution.slug,
			},
			language: classroomGameListing.language,
			includedLicenseQuantity: classroomGameListing.includedLicenseQuantity,
			licenseDurationDays: classroomGameListing.licenseDurationDays,
			courseType: classroomGameListing.courseType,
			price: classroomGameListing.price,
			customizationId: classroomGameListing.customization?.id,
			customizationCreatedAt: classroomGameListing.customization?.createdAt,
			customizationPublishedAt: classroomGameListing.customization?.publishedAt,
			publisher: {
				id: game.publisher.id!,
				name: game.publisher.name,
				slug: game.publisher.slug,
			},
			publishedAt: classroomGameListing.publishedAt,
			publisherVersion: classroomGameListing.gameVersion.publisherVersion,
			startAt: classroomGameListing.startAt,
		};
	}

}

export class GetAdminClassroomGameListingListResponseDto {

	@ApiProperty({ type: [AdminClassroomGameListingResponseDto] })
	classroomGameListingList!: AdminClassroomGameListingResponseDto[];

	@ApiProperty({ minimum: 0 })
	totalItemCount!: number;

	static fromQueryResult(result: { classroomGameListingList: ClassroomGameListing[]; totalItemCount: number }): GetAdminClassroomGameListingListResponseDto {
		return {
			classroomGameListingList: result.classroomGameListingList.map(AdminClassroomGameListingResponseDto.fromEntity),
			totalItemCount: result.totalItemCount,
		};
	}

}

export class GetAdminClassroomGameListingResponseDto {

	@ApiProperty({ type: AdminClassroomGameListingResponseDto })
	classroomGameListing!: AdminClassroomGameListingResponseDto;

	static fromEntity(classroomGameListing: ClassroomGameListing): GetAdminClassroomGameListingResponseDto {
		return { classroomGameListing: AdminClassroomGameListingResponseDto.fromEntity(classroomGameListing) };
	}

}