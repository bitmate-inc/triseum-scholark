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

import { GetCatalogClassroomListQuery, GetCatalogClassroomQuery } from '../../core/feature/catalog/query/get.catalog.classroom.query';
import {
	GetClassroomListQueryDto,
	GetClassroomListResponseDto,
	GetClassroomResponseDto,
} from './classroom.dto';

@ApiTags('Catalog Classrooms')
@Controller('api/v1/catalog/classroom')
export class ClassroomController {

	constructor(
		private readonly getClassroomListQuery: GetCatalogClassroomListQuery,
		private readonly getClassroomQuery: GetCatalogClassroomQuery,
	) {}

	@Get()
	@ApiOperation({ summary: 'List classrooms' })
	@ApiOkResponse({ type: GetClassroomListResponseDto })
	async getClassroomList(
		@Query() query: GetClassroomListQueryDto,
	): Promise<GetClassroomListResponseDto> {
		const result = await this.getClassroomListQuery.execute({
			filterBy: query.filterBy,
			pagination: query.pagination,
		});
		return GetClassroomListResponseDto.fromQueryResult(result);
	}

	@Get('by-slug/:slug')
	@ApiOperation({ summary: 'Get a classroom by slug' })
	@ApiParam({ name: 'slug' })
	@ApiOkResponse({ type: GetClassroomResponseDto })
	@ApiNotFoundResponse({ description: 'Classroom not found' })
	async getClassroomBySlug(@Param('slug') slug: string): Promise<GetClassroomResponseDto> {
		return this.getClassroom({ slug });
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a classroom by ID' })
	@ApiParam({ format: 'uuid', name: 'id' })
	@ApiOkResponse({ type: GetClassroomResponseDto })
	@ApiNotFoundResponse({ description: 'Classroom not found' })
	async getClassroomById(@Param('id', ParseUUIDPipe) id: string): Promise<GetClassroomResponseDto> {
		return this.getClassroom({ id });
	}

	private async getClassroom(
		filterBy: { id?: string; slug?: string },
	): Promise<GetClassroomResponseDto> {
		const result = await this.getClassroomQuery.execute({ filterBy });
		if (!result.classroom) {
			throw new NotFoundException('Classroom not found');
		}

		return GetClassroomResponseDto.fromEntity(result.classroom);
	}

}