import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { Classroom } from '../../education/model/classroom.entity';
import { Course } from '../../education/model/course.entity';
import { EducationCatalogStatus } from '../../education/model/education.catalog.status';
import { Instructor } from '../../education/model/instructor.entity';
import { ClassroomRepository } from '../../education/repository/classroom.repository';
import { CourseRepository } from '../../education/repository/course.repository';
import { InstitutionRepository } from '../../education/repository/institution.repository';
import { InstructorRepository } from '../../education/repository/instructor.repository';
import { TaxonomyTerm } from '../../taxonomy/model/taxonomy.term.entity';
import { TaxonomyTermRepository } from '../../taxonomy/repository/taxonomy.term.repository';

export interface CreateAdminClassroomCommandData {
	code: string;
	courseIdList?: string[];
	courseType: 'standard' | 'game-based';
	description?: string;
	institutionId: string;
	instructorIdList?: string[];
	language: string;
	name: string;
	slug: string;
	summary?: string;
	taxonomyTermIdList?: string[];
}

@Injectable()
export class CreateAdminClassroomCommand {

	constructor(
		private readonly classroomRepository: ClassroomRepository,
		private readonly courseRepository: CourseRepository,
		private readonly institutionRepository: InstitutionRepository,
		private readonly instructorRepository: InstructorRepository,
		private readonly taxonomyTermRepository: TaxonomyTermRepository,
	) {}

	async execute(data: CreateAdminClassroomCommandData): Promise<Classroom> {
		const institution = await this.institutionRepository.findOneBy({ id: data.institutionId });
		if (!institution) {
			throw new NotFoundException('Institution not found.');
		}
		if (institution.status !== EducationCatalogStatus.ACTIVE) {
			throw new ConflictException('An active classroom must belong to an active institution.');
		}

		const slug = data.slug.trim();
		const code = data.code.trim();
		if (await this.classroomRepository.findOneBy({ slug })) {
			throw new ConflictException('A classroom with this slug already exists.');
		}
		if (await this.classroomRepository.findOneBy({ institution: institution.id, code })) {
			throw new ConflictException('A classroom with this code already exists for this institution.');
		}

		const classroom = this.classroomRepository.create({
			code,
			courseType: data.courseType,
			description: data.description?.trim() || undefined,
			institution,
			language: data.language.trim(),
			name: data.name.trim(),
			slug,
			status: EducationCatalogStatus.ACTIVE,
			summary: data.summary?.trim() || undefined,
		});
		const { courseList, instructorList, taxonomyTermList } = await this.resolveAssociations(
			data.courseIdList ?? [],
			data.instructorIdList ?? [],
			data.taxonomyTermIdList ?? [],
			institution.id!,
			classroom.status,
		);
		classroom.courseList.set(courseList);
		classroom.instructorList.set(instructorList);
		classroom.taxonomyTermList.set(taxonomyTermList);

		await this.classroomRepository.save(classroom);

		return classroom;
	}

	private async resolveAssociations(
		courseIdList: string[],
		instructorIdList: string[],
		taxonomyTermIdList: string[],
		institutionId: string,
		status: EducationCatalogStatus,
	): Promise<{ courseList: Course[]; instructorList: Instructor[]; taxonomyTermList: TaxonomyTerm[] }> {
		const [courseList, instructorList, taxonomyTermList] = await Promise.all([
			this.courseRepository.findBy({ id: [...new Set(courseIdList)] }),
			this.instructorRepository.findBy({ id: [...new Set(instructorIdList)] }),
			this.taxonomyTermRepository.findBy({ id: [...new Set(taxonomyTermIdList)] }),
		]);
		if (courseList.length !== new Set(courseIdList).size
			|| instructorList.length !== new Set(instructorIdList).size
			|| taxonomyTermList.length !== new Set(taxonomyTermIdList).size) {
			throw new NotFoundException('One or more selected classroom associations were not found.');
		}
		if (courseList.some((course) => course.institution.id !== institutionId)) {
			throw new ConflictException('Classroom courses must belong to the selected institution.');
		}
		if (status === EducationCatalogStatus.ACTIVE && courseList.some((course) => course.status !== EducationCatalogStatus.ACTIVE)) {
			throw new ConflictException('An active classroom can only include active courses.');
		}

		return { courseList, instructorList, taxonomyTermList };
	}

}