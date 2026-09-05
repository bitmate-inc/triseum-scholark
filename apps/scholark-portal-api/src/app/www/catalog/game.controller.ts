import {
	Controller,
	Get,
	NotFoundException,
	Param,
	Query,
} from '@nestjs/common';
import {
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger';

import { GetCatalogGameListQuery } from '../../core/feature/catalog/query/get.catalog.game.list.query';
import { GetFeaturedGameListQuery } from '../../core/feature/catalog/query/get.featured.game.list.query';
import { GetGameQuery } from '../../core/feature/catalog/query/get.game.query';
import {
	GetGameListQueryDto,
	GetGameListResponseDto,
	GetGameResponseDto,
} from './game.dto';

@ApiTags('Catalog Games')
@Controller('api/v1/catalog/game')
export class GameController {

	constructor(
		private readonly getCatalogGameListQuery: GetCatalogGameListQuery,
		private readonly getFeaturedGameListQuery: GetFeaturedGameListQuery,
		private readonly getGameQuery: GetGameQuery,
	) {}

	@Get()
	@ApiOperation({ summary: 'List games' })
	@ApiOkResponse({ type: GetGameListResponseDto })
	async getGameList(@Query() query: GetGameListQueryDto): Promise<GetGameListResponseDto> {
		const result = await this.getCatalogGameListQuery.execute({
			filterBy: query.filterBy,
			include: { publisherList: true, taxonomyList: true },
			pagination: query.pagination,
		});
		return GetGameListResponseDto.fromQueryResult(result);
	}

	@Get('featured')
	@ApiOperation({ summary: 'List featured games' })
	@ApiOkResponse({ type: GetGameListResponseDto })
	async getFeaturedGameList(): Promise<GetGameListResponseDto> {
		const result = await this.getFeaturedGameListQuery.execute({
			include: { publisherList: true, taxonomyList: true },
		});
		return GetGameListResponseDto.fromQueryResult(result);
	}

	@Get(':slug')
	@ApiOperation({ summary: 'Get a game by slug' })
	@ApiParam({ name: 'slug' })
	@ApiOkResponse({ type: GetGameResponseDto })
	@ApiNotFoundResponse({ description: 'Game not found' })
	async getGame(@Param('slug') slug: string): Promise<GetGameResponseDto> {
		const result = await this.getGameQuery.execute({
			filterBy: { slug },
			include: { publisherList: true, taxonomyList: true },
		});

		if (!result.game) {
			throw new NotFoundException('Game not found');
		}

		return GetGameResponseDto.fromEntity(result.game);
	}

}