import { ConflictException, Injectable } from '@nestjs/common';

import { TaxonomyTerm, TaxonomyType } from '../../taxonomy/model/taxonomy.term.entity';
import { TaxonomyTermRepository } from '../../taxonomy/repository/taxonomy.term.repository';

export interface CreateAdminTaxonomyTermCommandData {
	label: string;
	slug: string;
	type: TaxonomyType;
}

@Injectable()
export class CreateAdminTaxonomyTermCommand {

	constructor(
		private readonly taxonomyTermRepository: TaxonomyTermRepository,
	) {}

	async execute(data: CreateAdminTaxonomyTermCommandData): Promise<TaxonomyTerm> {
		const slug = data.slug.trim();
		if (await this.taxonomyTermRepository.findOneBy({ slug, type: data.type })) {
			throw new ConflictException('A taxonomy term with this type and slug already exists.');
		}

		const taxonomyTerm = this.taxonomyTermRepository.create({
			label: data.label.trim(),
			slug,
			type: data.type,
		});
		await this.taxonomyTermRepository.save(taxonomyTerm);

		return taxonomyTerm;
	}

}