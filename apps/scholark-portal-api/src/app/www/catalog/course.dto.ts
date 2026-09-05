import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsEnum,
	IsOptional,
	IsUUID
} from 'class-validator';

import { GetListRequestQueryParamsDto } from '../../../lib/http/request-query.dto';
import { GetCatalogCourseListFilterByDto, GetCatalogCourseListQueryResult } from '../../core/feature/catalog/query/get.catalog.course.query';
import { Course } from '../../core/feature/education/model/course.entity';
import { EducationCatalogStatus } from '../../core/feature/education/model/education.catalog.status';
import { MediaResponseDto } from '../media/media.dto';
import { InstitutionResponseDto } from './institution.dto';

export class GetCourseListQueryDto extends GetListRequestQueryParamsDto {

	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	institutionId?: string;

	@ApiPropertyOptional({ enum: EducationCatalogStatus, enumName: 'EducationCatalogStatus' })
	@IsOptional()
	@IsEnum(EducationCatalogStatus)
	status?: EducationCatalogStatus;

	override get filterBy(): GetCatalogCourseListFilterByDto {
		return GetCatalogCourseListFilterByDto.create({
			...super.filterBy,
			institutionId: this.institutionId,
			status: this.status,
		});
	}

}

export class CourseResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ type: InstitutionResponseDto })
	institution!: InstitutionResponseDto;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	code!: string;

	@ApiProperty()
	slug!: string;

	@ApiPropertyOptional({ type: MediaResponseDto })
	cover?: MediaResponseDto;

	@ApiPropertyOptional()
	summary?: string;

	@ApiPropertyOptional()
	description?: string;

	@ApiProperty({ enum: EducationCatalogStatus, enumName: 'EducationCatalogStatus' })
	status!: EducationCatalogStatus;

	static fromEntity(course: Course): CourseResponseDto {
		return {
			code: course.code,
			cover: course.cover,
			description: course.description,
			id: course.id!,
			institution: InstitutionResponseDto.fromEntity(course.institution),
			name: course.name,
			slug: course.slug,
			status: course.status,
			summary: course.summary,
		};
	}

}

export class GetCourseResponseDto {

	@ApiProperty({ type: CourseResponseDto })
	course!: CourseResponseDto;

	static fromEntity(course: Course): GetCourseResponseDto {
		return { course: CourseResponseDto.fromEntity(course) };
	}

}

export class GetCourseListResponseDto {

	@ApiProperty({ type: [CourseResponseDto] })
	courseList!: CourseResponseDto[];

	@ApiProperty({ minimum: 0 })
	totalItemCount!: number;

	static fromQueryResult(result: GetCatalogCourseListQueryResult): GetCourseListResponseDto {
		return {
			courseList: result.courseList.map(CourseResponseDto.fromEntity),
			totalItemCount: result.totalItemCount,
		};
	}

}