import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { EducationCatalogStatus } from '../../education/model/education.catalog.status';
import { Institution } from '../../education/model/institution.entity';
import { ClassroomRepository } from '../../education/repository/classroom.repository';
import { CourseRepository } from '../../education/repository/course.repository';
import { InstitutionRepository } from '../../education/repository/institution.repository';

export interface UpdateAdminInstitutionCommandData {
	description?: string;
	name?: string;
	slug?: string;
	status?: EducationCatalogStatus;
	summary?: string;
	websiteUrl?: string;
}

@Injectable()
export class UpdateAdminInstitutionCommand {

	constructor(
		private readonly institutionRepository: InstitutionRepository,
		private readonly courseRepository: CourseRepository,
		private readonly classroomRepository: ClassroomRepository,
	) {}

	async execute(id: string, data: UpdateAdminInstitutionCommandData): Promise<Institution> {
		if (Object.keys(data).length === 0) {
			throw new BadRequestException('At least one institution field must be provided.');
		}

		const institution = await this.institutionRepository.findOneBy({ id });
		if (!institution) {
			throw new NotFoundException('Institution not found.');
		}

		if (typeof data.slug !== 'undefined') {
			const existingInstitution = await this.institutionRepository.findOneBy({ slug: data.slug.trim() });
			if (existingInstitution && existingInstitution.id !== id) {
				throw new ConflictException('An institution with this slug already exists.');
			}
			institution.slug = data.slug.trim();
		}
		if (typeof data.name !== 'undefined') {
			institution.name = data.name.trim();
		}
		if (typeof data.summary !== 'undefined') {
			institution.summary = data.summary.trim() || undefined;
		}
		if (typeof data.description !== 'undefined') {
			institution.description = data.description.trim() || undefined;
		}
		if (typeof data.websiteUrl !== 'undefined') {
			institution.websiteUrl = data.websiteUrl.trim() || undefined;
		}
		if (data.status === EducationCatalogStatus.INACTIVE) {
			const [activeCourseCount, activeClassroomCount] = await Promise.all([
				this.courseRepository.countActiveByInstitution(id),
				this.classroomRepository.countActiveByInstitution(id),
			]);
			if (activeCourseCount > 0 || activeClassroomCount > 0) {
				throw new ConflictException('Deactivate or reassign active courses and classrooms before deactivating this institution.');
			}
		}
		if (typeof data.status !== 'undefined') {
			institution.status = data.status;
		}

		await this.institutionRepository.save(institution);
		return institution;
	}

}