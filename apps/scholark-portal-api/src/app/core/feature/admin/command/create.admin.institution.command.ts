import { ConflictException, Injectable } from '@nestjs/common';

import { EducationCatalogStatus } from '../../education/model/education.catalog.status';
import { Institution } from '../../education/model/institution.entity';
import { InstitutionRepository } from '../../education/repository/institution.repository';

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
		private readonly institutionRepository: InstitutionRepository,
	) {}

	async execute(data: CreateAdminInstitutionCommandData): Promise<Institution> {
		const slug = data.slug.trim();
		if (await this.institutionRepository.findOneBy({ slug })) {
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
		await this.institutionRepository.save(institution);

		return institution;
	}

}