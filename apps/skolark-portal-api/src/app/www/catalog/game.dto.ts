import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { GetListRequestQueryParamsDto } from '../../../lib/http/request-query.dto';
import { GetCatalogGameListQueryResult } from '../../core/feature/catalog/query/get.catalog.game.list.query';
import { GetFeaturedGameListQueryResult } from '../../core/feature/catalog/query/get.featured.game.list.query';
import { Game, GameMedia } from '../../core/feature/game/model/game.entity';
import { TaxonomyType } from '../../core/feature/taxonomy/model/taxonomy.term.entity';

export class GetGameListQueryDto extends GetListRequestQueryParamsDto {}

class GameMediaResponseDto implements GameMedia {

	@ApiProperty({ enum: ['image', 'video'] })
	type!: 'image' | 'video';

	@ApiProperty()
	src!: string;

	@ApiProperty()
	alt!: string;

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

	@ApiPropertyOptional({ type: GameMediaResponseDto })
	cover?: GameMediaResponseDto;

	@ApiProperty({ type: [GameTaxonomyTermResponseDto] })
	taxonomyList!: GameTaxonomyTermResponseDto[];

	@ApiPropertyOptional({ minimum: 0, type: Number })
	estimatedLengthMinutesMin?: number;

	@ApiPropertyOptional({ minimum: 0, type: Number })
	estimatedLengthMinutesMax?: number;

	@ApiPropertyOptional()
	featured?: boolean;

	@ApiPropertyOptional({ type: [GameMediaResponseDto] })
	mediaList?: GameMediaResponseDto[];

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

export class GetGameResponseDto {

	@ApiProperty({ type: GameResponseDto })
	game!: GameResponseDto;

	static fromEntity(game: Game): GetGameResponseDto {
		return { game: GameResponseDto.fromEntity(game) };
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