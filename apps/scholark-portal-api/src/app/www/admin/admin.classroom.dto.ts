import { ApiProperty } from '@nestjs/swagger';

import { Classroom } from '../../core/feature/education/model/classroom.entity';
import { EducationCatalogStatus } from '../../core/feature/education/model/education.catalog.status';
import { InstitutionResponseDto } from '../catalog/institution.dto';

export class AdminClassroomListItemResponseDto {

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

	@ApiProperty({ enum: EducationCatalogStatus, enumName: 'EducationCatalogStatus' })
	status!: EducationCatalogStatus;

	static fromEntity(classroom: Classroom): AdminClassroomListItemResponseDto {
		return {
			code: classroom.code,
			id: classroom.id!,
			institution: InstitutionResponseDto.fromEntity(classroom.institution),
			name: classroom.name,
			slug: classroom.slug,
			status: classroom.status,
		};
	}

}

export class GetAdminClassroomListResponseDto {

	@ApiProperty({ type: [AdminClassroomListItemResponseDto] })
	classroomList!: AdminClassroomListItemResponseDto[];

	@ApiProperty({ minimum: 0 })
	totalItemCount!: number;

	static fromQueryResult(
		result: Awaited<ReturnType<import('../../core/feature/admin/query/get.admin.classroom.list.query').GetAdminClassroomListQuery['execute']>>,
	): GetAdminClassroomListResponseDto {
		return {
			classroomList: result.classroomList.map(AdminClassroomListItemResponseDto.fromEntity),
			totalItemCount: result.totalItemCount,
		};
	}

}