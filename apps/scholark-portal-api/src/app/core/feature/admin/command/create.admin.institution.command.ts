import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { ConflictException, Injectable } from '@nestjs/common';

import { EducationCatalogStatus } from '../../education/model/education.catalog.status';
import { Institution } from '../../education/model/institution.entity';

export interface CreateAdminInstitutionCommandData {
	description?: string;
	name: string;
	slug: string;
	summary?: string;
	websiteUrl?: string;
}

@Injectable()
export class CreateAdminInstitutionCommand {

	constructor(
		@InjectRepository(Institution)
		private readonly institutionRepository: EntityRepository<Institution>,
	) {}

	async execute(data: CreateAdminInstitutionCommandData): Promise<Institution> {
		const slug = data.slug.trim();
		if (await this.institutionRepository.findOne({ slug })) {
			throw new ConflictException('An institution with this slug already exists.');
		}

		const institution = this.institutionRepository.create({
			description: data.description?.trim() || undefined,
			name: data.name.trim(),
			slug,
			status: EducationCatalogStatus.ACTIVE,
			summary: data.summary?.trim() || undefined,
			websiteUrl: data.websiteUrl?.trim() || undefined,
		});
		const entityManager = this.institutionRepository.getEntityManager();
		entityManager.persist(institution);
		await entityManager.flush();

		return institution;
	}

}