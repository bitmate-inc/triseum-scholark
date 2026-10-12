import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsEnum,
	IsOptional,
	IsUUID
} from 'class-validator';

import { GetListRequestQueryParamsDto } from '../../../lib/http/request-query.dto';
import type { GetAdminGameListQueryData } from '../../core/feature/admin/query/get.admin.game.query';
import { Game } from '../../core/feature/game/model/game.entity';
import { GameVariant, GameVariantMode } from '../../core/feature/game/model/game.variant.entity';
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

export class AdminGamePublicListingResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ type: MoneyDto })
	price!: MoneyDto;

	@ApiProperty()
	available!: boolean;

	@ApiPropertyOptional({ format: 'date-time', type: String })
	publishedAt?: Date;

	static fromEntity(listing: PublicGameListing): AdminGamePublicListingResponseDto {
		return { available: listing.isAvailable, id: listing.id!, price: listing.price, publishedAt: listing.publishedAt ?? undefined };
	}

}

export class AdminGameVariantResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	language!: string;

	@ApiProperty({ enum: GameVariantMode, enumName: 'GameVariantMode' })
	mode!: GameVariantMode;

	@ApiProperty({ type: [AdminGamePublicListingResponseDto] })
	publicListingList!: AdminGamePublicListingResponseDto[];

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

	@ApiProperty({ type: [AdminGameVariantResponseDto] })
	variantList!: AdminGameVariantResponseDto[];

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
		gameVersionList: GameVersion[];
		gameVariantList: GameVariant[];
		publicGameListingList: PublicGameListing[];
	}): AdminGameResponseDto {
		const variantsByVersionId = new Map<string, GameVariant[]>();
		for (const variant of result.gameVariantList) {
			const versionId = variant.gameVersion.id!;
			const variants = variantsByVersionId.get(versionId) ?? [];
			variants.push(variant);
			variantsByVersionId.set(versionId, variants);
		}
		const publicListingsByVariantId = new Map<string, PublicGameListing[]>();
		for (const listing of result.publicGameListingList) {
			const variantId = listing.gameVariant.id!;
			const listings = publicListingsByVariantId.get(variantId) ?? [];
			listings.push(listing);
			publicListingsByVariantId.set(variantId, listings);
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
				description: version.description,
				id: version.id!,
				publishedAt: version.publishedAt,
				publisherVersion: version.publisherVersion,
				runUrl: version.runUrl,
				variantList: (variantsByVersionId.get(version.id!) ?? []).map((variant) => ({
					id: variant.id!,
					language: variant.language,
					mode: variant.mode,
					publicListingList: (publicListingsByVariantId.get(variant.id!) ?? []).map(AdminGamePublicListingResponseDto.fromEntity),
				})),
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