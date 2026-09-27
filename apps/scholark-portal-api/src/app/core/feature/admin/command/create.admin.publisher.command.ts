import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { ConflictException, Injectable } from '@nestjs/common';

import { Publisher } from '../../publisher/model/publisher.entity';

export interface CreateAdminPublisherCommandData {
	name: string;
	slug: string;
	websiteUrl?: string;
}

@Injectable()
export class CreateAdminPublisherCommand {

	constructor(
		@InjectRepository(Publisher)
		private readonly publisherRepository: EntityRepository<Publisher>,
	) {}

	async execute(data: CreateAdminPublisherCommandData): Promise<Publisher> {
		const slug = data.slug.trim();
		if (await this.publisherRepository.findOne({ slug })) {
			throw new ConflictException('A publisher with this slug already exists.');
		}

		const publisher = this.publisherRepository.create({
			name: data.name.trim(),
			slug,
			websiteUrl: data.websiteUrl?.trim() || undefined,
		});
		const entityManager = this.publisherRepository.getEntityManager();
		entityManager.persist(publisher);
		await entityManager.flush();

		return publisher;
	}

}