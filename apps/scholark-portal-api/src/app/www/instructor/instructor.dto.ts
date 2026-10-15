import { ApiProperty } from '@nestjs/swagger';

import { Classroom } from '../../core/feature/education/model/classroom.entity';
import { ClassroomGameListing } from '../../core/feature/education/model/classroom.game.listing.entity';
import { Instructor } from '../../core/feature/education/model/instructor.entity';
import type { GetInstructorClassroomResult } from '../../core/feature/education/query/get.instructor.portal.query';
import { GameLicense } from '../../core/feature/game/model/game.license.entity';

class InstructorInstitutionResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

	static fromEntity(institution: Classroom['institution']): InstructorInstitutionResponseDto {
		return { id: institution.id!, name: institution.name, slug: institution.slug };
	}

}

export class InstructorProfileResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

	static fromEntity(instructor: Instructor): InstructorProfileResponseDto {
		return { id: instructor.id!, name: instructor.name, slug: instructor.slug };
	}

}

export class InstructorClassroomListItemResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ type: InstructorInstitutionResponseDto })
	institution!: InstructorInstitutionResponseDto;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	code!: string;

	@ApiProperty()
	slug!: string;

	@ApiProperty()
	language!: string;

	@ApiProperty({ enum: ['standard', 'game-based'] })
	courseType!: 'standard' | 'game-based';

	static fromEntity(classroom: Classroom): InstructorClassroomListItemResponseDto {
		return {
			code: classroom.code,
			courseType: classroom.courseType,
			id: classroom.id!,
			institution: InstructorInstitutionResponseDto.fromEntity(classroom.institution),
			language: classroom.language,
			name: classroom.name,
			slug: classroom.slug,
		};
	}

}

export class InstructorClassroomListResponseDto {

	@ApiProperty({ type: [InstructorClassroomListItemResponseDto] })
	classroomList!: InstructorClassroomListItemResponseDto[];

	static fromEntityList(classroomList: Classroom[]): InstructorClassroomListResponseDto {
		return { classroomList: classroomList.map(InstructorClassroomListItemResponseDto.fromEntity) };
	}

}

class InstructorStudentResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	email!: string;

	@ApiProperty({ required: false })
	firstName?: string;

	@ApiProperty({ required: false })
	lastName?: string;

	@ApiProperty({ enum: ['active', 'upcoming', 'expired'] })
	licenseStatus!: 'active' | 'upcoming' | 'expired';

	@ApiProperty({ format: 'date-time' })
	startAt!: Date;

	@ApiProperty({ format: 'date-time' })
	endAt!: Date;

	static fromEntity(license: GameLicense, referenceDate: Date): InstructorStudentResponseDto {
		const licenseStatus = license.isActive(referenceDate)
			? 'active'
			: license.startAt > referenceDate ? 'upcoming' : 'expired';

		return {
			email: license.user.email,
			endAt: license.endAt,
			firstName: license.user.firstName,
			id: license.user.id!,
			lastName: license.user.lastName,
			licenseStatus,
			startAt: license.startAt,
		};
	}

}

class InstructorClassroomGameListingResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	gameTitle!: string;

	@ApiProperty()
	publisherVersion!: string;

	@ApiProperty({ type: [InstructorStudentResponseDto] })
	studentList!: InstructorStudentResponseDto[];

	static fromQueryResult(
		classroomGameListing: ClassroomGameListing,
		gameLicenseList: GameLicense[],
		referenceDate: Date,
	): InstructorClassroomGameListingResponseDto {
		return {
			gameTitle: classroomGameListing.gameVersion.game.title,
			id: classroomGameListing.id!,
			publisherVersion: classroomGameListing.gameVersion.publisherVersion,
			studentList: gameLicenseList
				.filter((license) => license.classroomGameListing?.id === classroomGameListing.id)
				.map((license) => InstructorStudentResponseDto.fromEntity(license, referenceDate)),
		};
	}

}

export class InstructorClassroomResponseDto {

	@ApiProperty({ type: InstructorClassroomListItemResponseDto })
	classroom!: InstructorClassroomListItemResponseDto;

	@ApiProperty({ type: [InstructorClassroomGameListingResponseDto] })
	classroomGameListingList!: InstructorClassroomGameListingResponseDto[];

	static fromQueryResult(result: GetInstructorClassroomResult): InstructorClassroomResponseDto {
		const referenceDate = new Date();

		return {
			classroom: InstructorClassroomListItemResponseDto.fromEntity(result.classroom),
			classroomGameListingList: result.classroomGameListingList.map((listing) =>
				InstructorClassroomGameListingResponseDto.fromQueryResult(
					listing,
					result.gameLicenseList,
					referenceDate,
				),
			),
		};
	}

}