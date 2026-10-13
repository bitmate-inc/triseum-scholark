import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { Course } from '../../education/model/course.entity';
import { EducationCatalogStatus } from '../../education/model/education.catalog.status';
import { CourseRepository } from '../../education/repository/course.repository';
import { InstitutionRepository } from '../../education/repository/institution.repository';

export interface UpdateAdminCourseCommandData {
	description?: string;
	institutionId?: string;
	name?: string;
	code?: string;
	slug?: string;
	status?: EducationCatalogStatus;
	summary?: string;
}

@Injectable()
export class UpdateAdminCourseCommand {

	constructor(
		private readonly courseRepository: CourseRepository,
		private readonly institutionRepository: InstitutionRepository,
	) {}

	async execute(id: string, data: UpdateAdminCourseCommandData): Promise<Course> {
		if (Object.keys(data).length === 0) {
			throw new BadRequestException('At least one course field must be provided.');
		}

		const course = await this.courseRepository.findOneBy({ id }, { relations: { institution: true } });
		if (!course) {
			throw new NotFoundException('Course not found.');
		}

		const institution = data.institutionId
			? await this.institutionRepository.findOneBy({ id: data.institutionId })
			: course.institution;
		if (!institution) {
			throw new NotFoundException('Institution not found.');
		}

		const nextStatus = data.status ?? course.status;
		if (nextStatus === EducationCatalogStatus.ACTIVE && institution.status !== EducationCatalogStatus.ACTIVE) {
			throw new ConflictException('An active course must belong to an active institution.');
		}

		const nextSlug = data.slug?.trim();
		if (nextSlug) {
			const existingCourse = await this.courseRepository.findOneBy({ slug: nextSlug });
			if (existingCourse && existingCourse.id !== id) {
				throw new ConflictException('A course with this slug already exists.');
			}
			course.slug = nextSlug;
		}

		const nextCode = data.code?.trim() ?? course.code;
		if (nextCode !== course.code || institution.id !== course.institution.id) {
			const existingCourse = await this.courseRepository.findOneBy({ institution: institution.id, code: nextCode });
			if (existingCourse && existingCourse.id !== id) {
				throw new ConflictException('A course with this code already exists for this institution.');
			}
		}

		if (typeof data.name !== 'undefined') {
			course.name = data.name.trim();
		}
		course.code = nextCode;
		course.institution = institution;
		if (typeof data.summary !== 'undefined') {
			course.summary = data.summary.trim() || undefined;
		}
		if (typeof data.description !== 'undefined') {
			course.description = data.description.trim() || undefined;
		}
		course.status = nextStatus;

		await this.courseRepository.save(course);
		return course;
	}

}