import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { Course } from '../../education/model/course.entity';
import { EducationCatalogStatus } from '../../education/model/education.catalog.status';
import { Institution } from '../../education/model/institution.entity';

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
		@InjectRepository(Course)
		private readonly courseRepository: EntityRepository<Course>,
		@InjectRepository(Institution)
		private readonly institutionRepository: EntityRepository<Institution>,
	) {}

	async execute(data: CreateAdminCourseCommandData): Promise<Course> {
		const institution = await this.institutionRepository.findOne({ id: data.institutionId });
		if (!institution) {
			throw new NotFoundException('Institution not found.');
		}
		if (institution.status !== EducationCatalogStatus.ACTIVE) {
			throw new ConflictException('An active course must belong to an active institution.');
		}

		const slug = data.slug.trim();
		const code = data.code.trim();
		const existingCourse = await this.courseRepository.findOne({ slug });
		if (existingCourse) {
			throw new ConflictException('A course with this slug already exists.');
		}
		if (await this.courseRepository.findOne({ institution: institution.id, code })) {
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
		const entityManager = this.courseRepository.getEntityManager();
		entityManager.persist(course);
		await entityManager.flush();

		return course;
	}

}