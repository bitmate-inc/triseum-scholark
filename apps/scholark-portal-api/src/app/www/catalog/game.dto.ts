import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

import { GetListRequestQueryParamsDto } from '../../../lib/http/request-query.dto';
import { GetCatalogGameListQueryResult } from '../../core/feature/catalog/query/get.catalog.game.list.query';
import { GetFeaturedGameListQueryResult } from '../../core/feature/catalog/query/get.featured.game.list.query';
import { Game } from '../../core/feature/game/model/game.entity';
import { GameProduct } from '../../core/feature/game/model/game.product.entity';
import { GameVersion } from '../../core/feature/game/model/game.version.entity';
import { Publisher } from '../../core/feature/publisher/model/publisher.entity';
import { TaxonomyType } from '../../core/feature/taxonomy/model/taxonomy.term.entity';
import { Currency } from '../../core/shared/commerce/model/currency';
import { Money } from '../../core/shared/commerce/model/money.entity';
import { MediaResponseDto } from '../media/media.dto';

export class GetGameListQueryDto extends GetListRequestQueryParamsDto {}

export class GameAcquisitionRequestDto {

	@ApiProperty({ format: 'uuid' })
	@IsUUID()
	gameProductId!: string;

}

class TaxonomyTermResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ enum: TaxonomyType, enumName: 'TaxonomyType' })
	type!: TaxonomyType;

	@ApiProperty()
	label!: string;

	@ApiProperty()
	slug!: string;

}

class GameTaxonomyTermResponseDto {

	@ApiProperty({ type: TaxonomyTermResponseDto })
	taxonomyTerm!: TaxonomyTermResponseDto;

	@ApiProperty()
	isPrimary!: boolean;

	@ApiProperty({ minimum: 0 })
	sortOrder!: number;

}

class PublisherResponseDto implements Pick<Publisher, 'id' | 'name' | 'slug' | 'websiteUrl'> {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

	@ApiPropertyOptional({ format: 'uri' })
	websiteUrl?: string;

}

export class MoneyDto implements Money {

	@ApiProperty()
	minorUnitAmount!: number;

	@ApiProperty()
	currency!: Currency;

}

export class GameResponseDto {

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

	@ApiPropertyOptional({ type: MediaResponseDto })
	cover?: MediaResponseDto;

	@ApiProperty({ type: [PublisherResponseDto] })
	publisherList!: PublisherResponseDto[];

	@ApiProperty({ type: [GameTaxonomyTermResponseDto] })
	taxonomyList!: GameTaxonomyTermResponseDto[];

	@ApiPropertyOptional({ minimum: 0, type: Number })
	estimatedLengthMinutesMin?: number;

	@ApiPropertyOptional({ minimum: 0, type: Number })
	estimatedLengthMinutesMax?: number;

	@ApiPropertyOptional()
	featured?: boolean;

	@ApiPropertyOptional({ type: [MediaResponseDto] })
	mediaList?: MediaResponseDto[];

	@ApiPropertyOptional({ format: 'date-time', type: String })
	publishedAt?: Date;

	static fromEntity(game: Game): GameResponseDto {
		return {
			cover: game.cover,
			description: game.description,
			estimatedLengthMinutesMax: game.estimatedLengthMinutesMax,
			estimatedLengthMinutesMin: game.estimatedLengthMinutesMin,
			featured: game.isFeatured,
			id: game.id!,
			mediaList: game.mediaList,
			publishedAt: game.publishedAt,
			publisherList: game.publisherList.getItems().map((publisher) => ({
				id: publisher.id!,
				name: publisher.name,
				slug: publisher.slug,
				websiteUrl: publisher.websiteUrl,
			})),
			slug: game.slug,
			summary: game.summary,
			taxonomyList: game.taxonomyList.getItems().map((association) => ({
				isPrimary: association.isPrimary,
				sortOrder: association.sortOrder,
				taxonomyTerm: {
					id: association.taxonomyTerm.id!,
					label: association.taxonomyTerm.label,
					slug: association.taxonomyTerm.slug,
					type: association.taxonomyTerm.type,
				},
			})),
			title: game.title,
		};
	}

}

class GameVersionResponseDto implements Pick<GameVersion, 'id' | 'description' | 'publisherVersion' | 'runUrl' | 'publishedAt'> {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ format: 'uuid' })
	productId!: string;

	@ApiPropertyOptional()
	description?: string;

	@ApiProperty()
	publisherVersion!: string;

	@ApiProperty({ format: 'uri' })
	runUrl!: string;

	@ApiPropertyOptional({ format: 'date-time', type: String })
	publishedAt?: Date;

}

export class GetGameResponseDto {

	@ApiProperty({ type: GameResponseDto })
	game!: GameResponseDto;

	@ApiProperty({ type: [GameVersionResponseDto] })
	gameVersionList!: GameVersionResponseDto[];

	static fromEntity(game: Game, gameVersionList: GameVersion[] = [], gameProductList: GameProduct[] = []): GetGameResponseDto {
		const productIdByVersionId = new Map(
			gameProductList.map((product) => [product.gameVariant.gameVersion.id, product.id!]),
		);

		return {
			game: GameResponseDto.fromEntity(game),
			gameVersionList: gameVersionList.map((gameVersion) => ({
				description: gameVersion.description,
				id: gameVersion.id!,
				productId: productIdByVersionId.get(gameVersion.id!)!,
				publishedAt: gameVersion.publishedAt,
				publisherVersion: gameVersion.publisherVersion,
				runUrl: gameVersion.runUrl,
			})),
		};
	}

}

export class GetGameListResponseDto {

	@ApiProperty({ type: [GameResponseDto] })
	gameList!: GameResponseDto[];

	@ApiProperty({ minimum: 0 })
	totalItemCount!: number;

	static fromQueryResult({
		gameList,
		totalItemCount,
	}:
    | GetCatalogGameListQueryResult
    | GetFeaturedGameListQueryResult): GetGameListResponseDto {
		return {
			gameList: gameList.map((game) => GameResponseDto.fromEntity(game)),
			totalItemCount,
		};
	}

}
