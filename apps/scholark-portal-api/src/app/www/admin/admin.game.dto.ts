import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsEnum,
	IsOptional,
	IsUUID
} from 'class-validator';

import { GetListRequestQueryParamsDto } from '../../../lib/http/request-query.dto';
import type { GetAdminGameListQueryData } from '../../core/feature/admin/query/get.admin.game.query';
import { GameCustomization } from '../../core/feature/game/model/game.customization.entity';
import { Game } from '../../core/feature/game/model/game.entity';
import { GameVersion } from '../../core/feature/game/model/game.version.entity';
import { PublicGameListing } from '../../core/feature/game/model/public.game.listing.entity';
import { MoneyDto } from '../catalog/game.dto';

enum GamePublicationFilter {
	PUBLISHED = 'published',
	UNPUBLISHED = 'unpublished',
	SCHEDULED = 'scheduled',
}

export class GetAdminGameListQueryDto extends GetListRequestQueryParamsDto {

	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	publisherId?: string;

	@ApiPropertyOptional({ enum: GamePublicationFilter })
	@IsOptional()
	@IsEnum(GamePublicationFilter)
	publication?: GamePublicationFilter;

	get adminFilterBy(): GetAdminGameListQueryData['filterBy'] {
		return { publication: this.publication, publisherId: this.publisherId, q: this.q };
	}

}

class AdminGamePublisherResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

}

export class AdminGameListItemResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	title!: string;

	@ApiProperty()
	slug!: string;

	@ApiProperty({ type: () => AdminGamePublisherResponseDto })
	publisher!: AdminGamePublisherResponseDto;

	@ApiPropertyOptional({ format: 'date-time', type: String })
	publishedAt?: Date;

	@ApiPropertyOptional()
	featured?: boolean;

	static fromEntity(game: Game): AdminGameListItemResponseDto {
		return {
			featured: game.isFeatured,
			id: game.id!,
			publishedAt: game.publishedAt,
			publisher: { id: game.publisher.id!, name: game.publisher.name, slug: game.publisher.slug },
			slug: game.slug,
			title: game.title,
		};
	}

}

export class AdminGamePublicListingPriceGroupResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ type: MoneyDto })
	price!: MoneyDto;

	@ApiProperty({ type: [String] })
	languageList!: string[];

}

export class AdminGamePublicListingResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ type: [AdminGamePublicListingPriceGroupResponseDto] })
	priceGroupList!: AdminGamePublicListingPriceGroupResponseDto[];

	@ApiProperty()
	available!: boolean;

	@ApiPropertyOptional({ format: 'date-time', type: String })
	publishedAt?: Date;

	@ApiProperty({ format: 'date-time', type: String })
	startAt!: Date;

	@ApiPropertyOptional({ format: 'date-time', type: String })
	endAt?: Date;

	static fromEntity(listing: PublicGameListing): AdminGamePublicListingResponseDto {
		return {
			available: listing.isAvailable,
			endAt: listing.endAt,
			id: listing.id!,
			priceGroupList: listing.priceGroupList.getItems().map((priceGroup) => ({
				id: priceGroup.id!,
				languageList: priceGroup.languageList.getItems().map((language) => language.language),
				price: priceGroup.price,
			})),
			publishedAt: listing.publishedAt ?? undefined,
			startAt: listing.startAt!,
		};
	}

}

export class AdminGameCustomizationResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ format: 'date-time', type: String })
	createdAt!: Date;

	@ApiPropertyOptional({ format: 'date-time', type: String })
	publishedAt?: Date;

	static fromEntity(customization: GameCustomization): AdminGameCustomizationResponseDto {
		return {
			createdAt: customization.createdAt!,
			id: customization.id!,
			publishedAt: customization.publishedAt,
		};
	}

}

export class AdminGameVersionResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	publisherVersion!: string;

	@ApiPropertyOptional()
	description?: string;

	@ApiProperty({ format: 'uri' })
	runUrl!: string;

	@ApiPropertyOptional({ format: 'date-time', type: String })
	publishedAt?: Date;

	@ApiProperty({ type: [AdminGamePublicListingResponseDto] })
	publicListingList!: AdminGamePublicListingResponseDto[];

	@ApiProperty({ type: [AdminGameCustomizationResponseDto] })
	customizationList!: AdminGameCustomizationResponseDto[];

}

export class AdminGameResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	title!: string;

	@ApiProperty()
	slug!: string;

	@ApiPropertyOptional()
	summary?: string;

	@ApiPropertyOptional()
	description?: string;

	@ApiProperty({ type: () => AdminGamePublisherResponseDto })
	publisher!: AdminGamePublisherResponseDto;

	@ApiPropertyOptional({ format: 'date-time', type: String })
	publishedAt?: Date;

	@ApiPropertyOptional()
	featured?: boolean;

	@ApiProperty({ type: [AdminGameVersionResponseDto] })
	versionList!: AdminGameVersionResponseDto[];

	static fromQueryResult(result: {
		game: Game;
		gameCustomizationList: GameCustomization[];
		gameVersionList: GameVersion[];
		publicGameListingList: PublicGameListing[];
	}): AdminGameResponseDto {
		const publicListingsByVersionId = new Map<string, PublicGameListing[]>();
		const customizationsByVersionId = new Map<string, GameCustomization[]>();
		for (const listing of result.publicGameListingList) {
			const versionId = listing.gameVersion.id!;
			const listings = publicListingsByVersionId.get(versionId) ?? [];
			listings.push(listing);
			publicListingsByVersionId.set(versionId, listings);
		}
		for (const customization of result.gameCustomizationList) {
			const versionId = customization.gameVersion.id!;
			const customizations = customizationsByVersionId.get(versionId) ?? [];
			customizations.push(customization);
			customizationsByVersionId.set(versionId, customizations);
		}
		return {
			description: result.game.description,
			featured: result.game.isFeatured,
			id: result.game.id!,
			publishedAt: result.game.publishedAt,
			publisher: {
				id: result.game.publisher.id!,
				name: result.game.publisher.name,
				slug: result.game.publisher.slug,
			},
			slug: result.game.slug,
			summary: result.game.summary,
			title: result.game.title,
			versionList: result.gameVersionList.map((version) => ({
				customizationList: (customizationsByVersionId.get(version.id!) ?? [])
					.sort((first, second) => second.createdAt!.getTime() - first.createdAt!.getTime())
					.map(AdminGameCustomizationResponseDto.fromEntity),
				description: version.description,
				id: version.id!,
				publishedAt: version.publishedAt,
				publisherVersion: version.publisherVersion,
				runUrl: version.runUrl,
				publicListingList: (publicListingsByVersionId.get(version.id!) ?? []).map(AdminGamePublicListingResponseDto.fromEntity),
			})),
		};
	}

}

export class GetAdminGameListResponseDto {

	@ApiProperty({ type: [AdminGameListItemResponseDto] })
	gameList!: AdminGameListItemResponseDto[];

	@ApiProperty({ minimum: 0 })
	totalItemCount!: number;

	static fromQueryResult(result: { gameList: Game[]; totalItemCount: number }): GetAdminGameListResponseDto {
		return { gameList: result.gameList.map(AdminGameListItemResponseDto.fromEntity), totalItemCount: result.totalItemCount };
	}

}

export class GetAdminGameResponseDto {

	@ApiProperty({ type: AdminGameResponseDto })
	game!: AdminGameResponseDto;

	static fromQueryResult(result: Parameters<typeof AdminGameResponseDto.fromQueryResult>[0]): GetAdminGameResponseDto {
		return { game: AdminGameResponseDto.fromQueryResult(result) };
	}

}