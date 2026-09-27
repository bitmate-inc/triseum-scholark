import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { ConflictException, Injectable } from '@nestjs/common';

import { TaxonomyTerm, TaxonomyType } from '../../taxonomy/model/taxonomy.term.entity';

export interface CreateAdminTaxonomyTermCommandData {
	label: string;
	slug: string;
	type: TaxonomyType;
}

@Injectable()
export class CreateAdminTaxonomyTermCommand {

	constructor(
		@InjectRepository(TaxonomyTerm)
		private readonly taxonomyTermRepository: EntityRepository<TaxonomyTerm>,
	) {}

	async execute(data: CreateAdminTaxonomyTermCommandData): Promise<TaxonomyTerm> {
		const slug = data.slug.trim();
		if (await this.taxonomyTermRepository.findOne({ slug, type: data.type })) {
			throw new ConflictException('A taxonomy term with this type and slug already exists.');
		}

		const taxonomyTerm = this.taxonomyTermRepository.create({
			label: data.label.trim(),
			slug,
			type: data.type,
		});
		const entityManager = this.taxonomyTermRepository.getEntityManager();
		entityManager.persist(taxonomyTerm);
		await entityManager.flush();

		return taxonomyTerm;
	}

}