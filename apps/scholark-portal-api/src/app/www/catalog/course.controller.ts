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

import { GetCatalogCourseListQuery, GetCatalogCourseQuery } from '../../core/feature/catalog/query/get.catalog.course.query';
import {
	GetCourseListQueryDto,
	GetCourseListResponseDto,
	GetCourseResponseDto,
} from './course.dto';

@ApiTags('Catalog Courses')
@Controller('api/v1/catalog/course')
export class CourseController {

	constructor(
		private readonly getCourseListQuery: GetCatalogCourseListQuery,
		private readonly getCourseQuery: GetCatalogCourseQuery,
	) {}

	@Get()
	@ApiOperation({ summary: 'List courses' })
	@ApiOkResponse({ type: GetCourseListResponseDto })
	async getCourseList(@Query() query: GetCourseListQueryDto): Promise<GetCourseListResponseDto> {
		const result = await this.getCourseListQuery.execute({
			filterBy: query.filterBy,
			pagination: query.pagination,
		});
		return GetCourseListResponseDto.fromQueryResult(result);
	}

	@Get('by-slug/:slug')
	@ApiOperation({ summary: 'Get a course by slug' })
	@ApiParam({ name: 'slug' })
	@ApiOkResponse({ type: GetCourseResponseDto })
	@ApiNotFoundResponse({ description: 'Course not found' })
	async getCourseBySlug(@Param('slug') slug: string): Promise<GetCourseResponseDto> {
		return this.getCourse({ slug });
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a course by ID' })
	@ApiParam({ format: 'uuid', name: 'id' })
	@ApiOkResponse({ type: GetCourseResponseDto })
	@ApiNotFoundResponse({ description: 'Course not found' })
	async getCourseById(@Param('id', ParseUUIDPipe) id: string): Promise<GetCourseResponseDto> {
		return this.getCourse({ id });
	}

	private async getCourse(filterBy: { id?: string; slug?: string }): Promise<GetCourseResponseDto> {
		const result = await this.getCourseQuery.execute({ filterBy });
		if (!result.course) {
			throw new NotFoundException('Course not found');
		}

		return GetCourseResponseDto.fromEntity(result.course);
	}

}