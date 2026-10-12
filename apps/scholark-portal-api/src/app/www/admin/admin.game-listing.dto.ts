import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { GetListRequestQueryParamsDto } from '../../../lib/http/request-query.dto';
import type { GetAdminGameListingListQueryData } from '../../core/feature/admin/query/get.admin.game.listing.query';
import { ClassroomGameListing, ClassroomGameListingDesignatedPayor } from '../../core/feature/education/model/classroom.game.listing.entity';
import { GameVariantMode } from '../../core/feature/game/model/game.variant.entity';
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

class AdminGameListingVariantResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	language!: string;

	@ApiProperty({ enum: GameVariantMode, enumName: 'GameVariantMode' })
	mode!: GameVariantMode;

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

	@ApiProperty({ type: AdminGameListingVariantResponseDto })
	gameVariant!: AdminGameListingVariantResponseDto;

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
		const variant = listing.gameVariant;
		const version = variant.gameVersion;
		const game = version.game;
		const base = {
			game: { id: game.id!, slug: game.slug, title: game.title },
			gameVariant: { id: variant.id!, language: variant.language, mode: variant.mode },
			gameVersion: { id: version.id!, publisherVersion: version.publisherVersion },
			id: listing.id!,
			price: listing.price,
			publisher: { id: game.publisher.id!, name: game.publisher.name, slug: game.publisher.slug },
		};

		if (listing instanceof PublicGameListing) {
			return {
				...base,
				available: listing.isAvailable,
				listingType: 'public',
				publishedAt: listing.publishedAt ?? undefined,
			};
		}

		return {
			...base,
			classroom: {
				id: listing.classroom.id!,
				institutionName: listing.classroom.institution.name,
				name: listing.classroom.name,
				slug: listing.classroom.slug,
			},
			designatedPayor: listing.designatedPayor,
			endAt: listing.endAt,
			includedLicenseQuantity: listing.includedLicenseQuantity,
			licenseDurationDays: listing.licenseDurationDays,
			listingType: 'classroom',
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