import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { Course } from '../../education/model/course.entity';
import { EducationCatalogStatus } from '../../education/model/education.catalog.status';
import { CourseRepository } from '../../education/repository/course.repository';
import { InstitutionRepository } from '../../education/repository/institution.repository';

export interface CreateAdminCourseCommandData {
	description?: string;
	institutionId: string;
	name: string;
	code: string;
	slug: string;
	summary?: string;
}

@Injectable()
export class CreateAdminCourseCommand {

	constructor(
		private readonly courseRepository: CourseRepository,
		private readonly institutionRepository: InstitutionRepository,
	) {}

	async execute(data: CreateAdminCourseCommandData): Promise<Course> {
		const institution = await this.institutionRepository.findOneBy({ id: data.institutionId });
		if (!institution) {
			throw new NotFoundException('Institution not found.');
		}
		if (institution.status !== EducationCatalogStatus.ACTIVE) {
			throw new ConflictException('An active course must belong to an active institution.');
		}

		const slug = data.slug.trim();
		const code = data.code.trim();
		const existingCourse = await this.courseRepository.findOneBy({ slug });
		if (existingCourse) {
			throw new ConflictException('A course with this slug already exists.');
		}
		if (await this.courseRepository.findOneBy({ institution: institution.id, code })) {
			throw new ConflictException('A course with this code already exists for this institution.');
		}

		const course = this.courseRepository.create({
			code,
			description: data.description?.trim() || undefined,
			institution,
			name: data.name.trim(),
			slug,
			status: EducationCatalogStatus.ACTIVE,
			summary: data.summary?.trim() || undefined,
		});
		await this.courseRepository.save(course);

		return course;
	}

}