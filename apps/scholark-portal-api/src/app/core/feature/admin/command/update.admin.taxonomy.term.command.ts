import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { TaxonomyTerm, TaxonomyType } from '../../taxonomy/model/taxonomy.term.entity';

export interface UpdateAdminTaxonomyTermCommandData {
	label?: string;
	slug?: string;
	type?: TaxonomyType;
}

@Injectable()
export class UpdateAdminTaxonomyTermCommand {

	constructor(
		@InjectRepository(TaxonomyTerm)
		private readonly taxonomyTermRepository: EntityRepository<TaxonomyTerm>,
	) {}

	async execute(id: string, data: UpdateAdminTaxonomyTermCommandData): Promise<TaxonomyTerm> {
		if (Object.keys(data).length === 0) {
			throw new BadRequestException('At least one taxonomy term field must be provided.');
		}

		const taxonomyTerm = await this.taxonomyTermRepository.findOne({ id });
		if (!taxonomyTerm) {
			throw new NotFoundException('Taxonomy term not found.');
		}

		const type = data.type ?? taxonomyTerm.type;
		const slug = data.slug?.trim() ?? taxonomyTerm.slug;
		if (type !== taxonomyTerm.type || slug !== taxonomyTerm.slug) {
			const existingTerm = await this.taxonomyTermRepository.findOne({ slug, type });
			if (existingTerm && existingTerm.id !== id) {
				throw new ConflictException('A taxonomy term with this type and slug already exists.');
			}
		}

		if (typeof data.label !== 'undefined') {
			taxonomyTerm.label = data.label.trim();
		}
		taxonomyTerm.slug = slug;
		taxonomyTerm.type = type;
		await this.taxonomyTermRepository.getEntityManager().flush();

		return taxonomyTerm;
	}

}