import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

import { GetListRequestQueryParamsDto } from '../../../lib/http/request-query.dto';
import type { GetAdminInstructorListQueryData } from '../../core/feature/admin/query/get.admin.instructor.query';
import { Classroom } from '../../core/feature/education/model/classroom.entity';
import { Institution } from '../../core/feature/education/model/institution.entity';
import { Instructor } from '../../core/feature/education/model/instructor.entity';
import { InstructorUser } from '../../core/feature/education/model/instructor.user.entity';
import { User } from '../../core/feature/user/model/user.entity';

export class GetAdminInstructorListQueryDto extends GetListRequestQueryParamsDto {

	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	institutionId?: string;

	get adminFilterBy(): GetAdminInstructorListQueryData['filterBy'] {
		return { institutionId: this.institutionId, q: this.q };
	}

}

export class AdminInstructorListItemResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

	@ApiProperty()
	hasAccount!: boolean;

	static fromEntity(instructor: Instructor, hasAccount: boolean): AdminInstructorListItemResponseDto {
		return { hasAccount, id: instructor.id!, name: instructor.name, slug: instructor.slug };
	}

}

class AdminInstructorInstitutionResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

}

class AdminInstructorClassroomResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	code!: string;

	@ApiProperty()
	slug!: string;

	@ApiProperty({ type: () => AdminInstructorInstitutionResponseDto })
	institution!: AdminInstructorInstitutionResponseDto;

	static fromEntity(classroom: Classroom): AdminInstructorClassroomResponseDto {
		return {
			code: classroom.code,
			id: classroom.id!,
			institution: {
				id: classroom.institution.id!,
				name: classroom.institution.name,
				slug: classroom.institution.slug,
			},
			name: classroom.name,
			slug: classroom.slug,
		};
	}

}

class AdminInstructorAccountUserResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	email!: string;

	@ApiPropertyOptional()
	firstName?: string;

	@ApiPropertyOptional()
	lastName?: string;

	static fromEntity(user: User): AdminInstructorAccountUserResponseDto {
		return { email: user.email, firstName: user.firstName, id: user.id!, lastName: user.lastName };
	}

}

export class AdminInstructorResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

	@ApiProperty({ type: [AdminInstructorInstitutionResponseDto] })
	institutionList!: AdminInstructorInstitutionResponseDto[];

	@ApiProperty({ type: [AdminInstructorClassroomResponseDto] })
	classroomList!: AdminInstructorClassroomResponseDto[];

	@ApiPropertyOptional({ type: AdminInstructorAccountUserResponseDto })
	accountUser?: AdminInstructorAccountUserResponseDto;

	static fromQueryResult(result: {
		classroomList: Classroom[];
		instructor: Instructor;
		instructorUser?: InstructorUser;
		institutionList: Institution[];
	}): AdminInstructorResponseDto {
		return {
			accountUser: result.instructorUser ? AdminInstructorAccountUserResponseDto.fromEntity(result.instructorUser.user) : undefined,
			classroomList: result.classroomList.map(AdminInstructorClassroomResponseDto.fromEntity),
			id: result.instructor.id!,
			institutionList: result.institutionList.map(({ id, name, slug }) => ({ id: id!, name, slug })),
			name: result.instructor.name,
			slug: result.instructor.slug,
		};
	}

}

export class GetAdminInstructorListResponseDto {

	@ApiProperty({ type: [AdminInstructorListItemResponseDto] })
	instructorList!: AdminInstructorListItemResponseDto[];

	@ApiProperty({ minimum: 0 })
	totalItemCount!: number;

	static fromQueryResult(result: {
		instructorIdWithAccountSet: Set<string>;
		instructorList: Instructor[];
		totalItemCount: number;
	}): GetAdminInstructorListResponseDto {
		return {
			instructorList: result.instructorList.map((instructor) =>
				AdminInstructorListItemResponseDto.fromEntity(
					instructor,
					result.instructorIdWithAccountSet.has(instructor.id!),
				),
			),
			totalItemCount: result.totalItemCount,
		};
	}

}

export class GetAdminInstructorResponseDto {

	@ApiProperty({ type: AdminInstructorResponseDto })
	instructor!: AdminInstructorResponseDto;

	static fromQueryResult(result: {
		classroomList: Classroom[];
		instructor: Instructor;
		instructorUser?: InstructorUser;
		institutionList: Institution[];
	}): GetAdminInstructorResponseDto {
		return { instructor: AdminInstructorResponseDto.fromQueryResult(result) };
	}

}