import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { GetListRequestQueryParamsDto } from '../../../lib/http/request-query.dto';
import type { GetAdminGameListingListQueryData } from '../../core/feature/admin/query/get.admin.game.listing.query';
import { ClassroomGameListing, ClassroomGameListingDesignatedPayor } from '../../core/feature/education/model/classroom.game.listing.entity';
import { PublicGameListing } from '../../core/feature/game/model/public.game.listing.entity';
import { MoneyDto } from '../catalog/game.dto';

enum AdminGameListingTypeFilter {
	PUBLIC = 'public',
	CLASSROOM = 'classroom',
}

export class GetAdminGameListingListQueryDto extends GetListRequestQueryParamsDto {

	@ApiProperty({ enum: AdminGameListingTypeFilter })
	@IsEnum(AdminGameListingTypeFilter)
	type!: AdminGameListingTypeFilter;

	get adminFilterBy(): GetAdminGameListingListQueryData['filterBy'] {
		return { q: this.q, type: this.type };
	}

}

class AdminGameListingGameResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	title!: string;

	@ApiProperty()
	slug!: string;

}

class AdminGameListingPublisherResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

}

class AdminGameListingVersionResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	publisherVersion!: string;

}

class AdminGameListingPriceGroupResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ type: MoneyDto })
	price!: MoneyDto;

	@ApiProperty({ type: [String] })
	languageList!: string[];

}

export class AdminGameListingListItemResponseDto {

	@ApiProperty({ enum: ['public', 'classroom'] })
	listingType!: 'public' | 'classroom';

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiPropertyOptional({ type: MoneyDto })
	price?: MoneyDto;

	@ApiProperty({ type: AdminGameListingGameResponseDto })
	game!: AdminGameListingGameResponseDto;

	@ApiProperty({ type: AdminGameListingPublisherResponseDto })
	publisher!: AdminGameListingPublisherResponseDto;

	@ApiProperty({ type: AdminGameListingVersionResponseDto })
	gameVersion!: AdminGameListingVersionResponseDto;

	@ApiPropertyOptional({ type: [AdminGameListingPriceGroupResponseDto] })
	priceGroupList?: AdminGameListingPriceGroupResponseDto[];

	@ApiPropertyOptional()
	language?: string;

	@ApiPropertyOptional()
	courseType?: string;

	@ApiPropertyOptional()
	available?: boolean;

	@ApiPropertyOptional({ format: 'date-time', type: String })
	publishedAt?: Date;

	@ApiPropertyOptional({ enum: ClassroomGameListingDesignatedPayor, enumName: 'ClassroomGameListingDesignatedPayor' })
	designatedPayor?: ClassroomGameListingDesignatedPayor;

	@ApiPropertyOptional({ minimum: 0 })
	includedLicenseQuantity?: number;

	@ApiPropertyOptional({ minimum: 1 })
	licenseDurationDays?: number;

	@ApiPropertyOptional({ type: Object })
	classroom?: { id: string; name: string; slug: string; institutionName: string };

	@ApiPropertyOptional({ format: 'date-time', type: String })
	startAt?: Date;

	@ApiPropertyOptional({ format: 'date-time', type: String })
	endAt?: Date;

	static fromEntity(listing: PublicGameListing | ClassroomGameListing): AdminGameListingListItemResponseDto {
		const version = listing.gameVersion;
		const game = version.game;
		const base = {
			game: { id: game.id!, slug: game.slug, title: game.title },
			gameVersion: { id: version.id!, publisherVersion: version.publisherVersion },
			id: listing.id!,
			publisher: { id: game.publisher.id!, name: game.publisher.name, slug: game.publisher.slug },
		};

		if (listing instanceof PublicGameListing) {
			return {
				...base,
				available: listing.isAvailable,
				endAt: listing.endAt,
				listingType: 'public',
				priceGroupList: listing.priceGroupList.getItems().map((priceGroup) => ({
					id: priceGroup.id!,
					languageList: priceGroup.languageList.getItems().map((language) => language.language),
					price: priceGroup.price,
				})),
				publishedAt: listing.publishedAt ?? undefined,
				startAt: listing.startAt,
			};
		}

		return {
			...base,
			courseType: listing.courseType,
			classroom: {
				id: listing.classroom.id!,
				institutionName: listing.classroom.institution.name,
				name: listing.classroom.name,
				slug: listing.classroom.slug,
			},
			designatedPayor: listing.designatedPayor,
			endAt: listing.endAt,
			includedLicenseQuantity: listing.includedLicenseQuantity,
			language: listing.language,
			licenseDurationDays: listing.licenseDurationDays,
			listingType: 'classroom',
			price: listing.price,
			publishedAt: listing.publishedAt,
			startAt: listing.startAt,
		};
	}

}

export class GetAdminGameListingListResponseDto {

	@ApiProperty({ type: [AdminGameListingListItemResponseDto] })
	listingList!: AdminGameListingListItemResponseDto[];

	@ApiProperty({ minimum: 0 })
	totalItemCount!: number;

	static fromQueryResult(result: {
		listingList: (PublicGameListing | ClassroomGameListing)[];
		totalItemCount: number;
	}): GetAdminGameListingListResponseDto {
		return {
			listingList: result.listingList.map(AdminGameListingListItemResponseDto.fromEntity),
			totalItemCount: result.totalItemCount,
		};
	}

}