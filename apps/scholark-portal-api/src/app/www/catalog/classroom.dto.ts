import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsEnum,
	IsOptional,
	IsUUID
} from 'class-validator';

import { GetListRequestQueryParamsDto } from '../../../lib/http/request-query.dto';
import { GetCatalogClassroomListFilterByDto, GetCatalogClassroomListQueryResult } from '../../core/feature/catalog/query/get.catalog.classroom.query';
import { Classroom } from '../../core/feature/education/model/classroom.entity';
import { EducationCatalogStatus } from '../../core/feature/education/model/education.catalog.status';
import { TaxonomyType } from '../../core/feature/taxonomy/model/taxonomy.term.entity';
import { MediaResponseDto } from '../media/media.dto';
import { InstitutionResponseDto } from './institution.dto';

export class GetClassroomListQueryDto extends GetListRequestQueryParamsDto {

	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	institutionId?: string;

	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	courseId?: string;

	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	taxonomyTermId?: string;

	@ApiPropertyOptional({ enum: EducationCatalogStatus, enumName: 'EducationCatalogStatus' })
	@IsOptional()
	@IsEnum(EducationCatalogStatus)
	status?: EducationCatalogStatus;

	override get filterBy(): GetCatalogClassroomListFilterByDto {
		return GetCatalogClassroomListFilterByDto.create({
			...super.filterBy,
			courseId: this.courseId,
			institutionId: this.institutionId,
			status: this.status,
			taxonomyTermId: this.taxonomyTermId,
		});
	}

}

class ClassroomCourseResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	code!: string;

	@ApiProperty()
	slug!: string;

}

class ClassroomTaxonomyTermResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ enum: TaxonomyType, enumName: 'TaxonomyType' })
	type!: TaxonomyType;

	@ApiProperty()
	label!: string;

	@ApiProperty()
	slug!: string;

}

class ClassroomInstructorResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

}

export class ClassroomResponseDto {

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

	@ApiProperty({ type: [ClassroomCourseResponseDto] })
	courseList!: ClassroomCourseResponseDto[];

	@ApiProperty({ type: [ClassroomInstructorResponseDto] })
	instructorList!: ClassroomInstructorResponseDto[];

	@ApiProperty({ type: [ClassroomTaxonomyTermResponseDto] })
	taxonomyTermList!: ClassroomTaxonomyTermResponseDto[];

	static fromEntity(classroom: Classroom): ClassroomResponseDto {
		return {
			code: classroom.code,
			cover: classroom.cover,
			courseList: classroom.courseList.getItems().map((course) => ({
				code: course.code,
				id: course.id!,
				name: course.name,
				slug: course.slug,
			})),
			description: classroom.description,
			id: classroom.id!,
			institution: InstitutionResponseDto.fromEntity(classroom.institution),
			instructorList: classroom.instructorList.getItems().map((instructor) => ({
				id: instructor.id!,
				name: instructor.name,
				slug: instructor.slug,
			})),
			name: classroom.name,
			slug: classroom.slug,
			status: classroom.status,
			summary: classroom.summary,
			taxonomyTermList: classroom.taxonomyTermList.getItems().map((term) => ({
				id: term.id!,
				label: term.label,
				slug: term.slug,
				type: term.type,
			})),
		};
	}

}

export class GetClassroomResponseDto {

	@ApiProperty({ type: ClassroomResponseDto })
	classroom!: ClassroomResponseDto;

	static fromEntity(classroom: Classroom): GetClassroomResponseDto {
		return { classroom: ClassroomResponseDto.fromEntity(classroom) };
	}

}

export class GetClassroomListResponseDto {

	@ApiProperty({ type: [ClassroomResponseDto] })
	classroomList!: ClassroomResponseDto[];

	@ApiProperty({ minimum: 0 })
	totalItemCount!: number;

	static fromQueryResult(result: GetCatalogClassroomListQueryResult): GetClassroomListResponseDto {
		return {
			classroomList: result.classroomList.map(ClassroomResponseDto.fromEntity),
			totalItemCount: result.totalItemCount,
		};
	}

}