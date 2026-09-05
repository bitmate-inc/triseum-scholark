import {
	Controller,
	Get,
	NotFoundException,
	Param,
	ParseUUIDPipe,
	Query,
} from '@nestjs/common';
import {
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger';

import { GetCatalogClassroomGameListQuery, GetCatalogClassroomGameQuery } from '../../core/feature/catalog/query/get.catalog.classroom-game.query';
import {
	GetClassroomGameListQueryDto,
	GetClassroomGameListResponseDto,
	GetClassroomGameResponseDto,
} from './classroom-game.dto';

@ApiTags('Catalog Classroom Games')
@Controller('api/v1/catalog/classroom-game')
export class ClassroomGameController {

	constructor(
		private readonly getClassroomGameListQuery: GetCatalogClassroomGameListQuery,
		private readonly getClassroomGameQuery: GetCatalogClassroomGameQuery,
	) {}

	@Get()
	@ApiOperation({ summary: 'List classroom game assignments' })
	@ApiOkResponse({ type: GetClassroomGameListResponseDto })
	async getClassroomGameList(
		@Query() query: GetClassroomGameListQueryDto,
	): Promise<GetClassroomGameListResponseDto> {
		const result = await this.getClassroomGameListQuery.execute({
			filterBy: query.filterBy,
			pagination: query.pagination,
		});
		return GetClassroomGameListResponseDto.fromQueryResult(result);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a classroom game assignment by ID' })
	@ApiParam({ format: 'uuid', name: 'id' })
	@ApiOkResponse({ type: GetClassroomGameResponseDto })
	@ApiNotFoundResponse({ description: 'Classroom game assignment not found' })
	async getClassroomGameById(
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<GetClassroomGameResponseDto> {
		const result = await this.getClassroomGameQuery.execute({ filterBy: { id } });
		if (!result.classroomGame) {
			throw new NotFoundException('Classroom game assignment not found');
		}

		return GetClassroomGameResponseDto.fromEntity(result.classroomGame);
	}

}