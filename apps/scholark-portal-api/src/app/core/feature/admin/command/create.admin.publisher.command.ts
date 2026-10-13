import { ConflictException, Injectable } from '@nestjs/common';

import { Publisher } from '../../publisher/model/publisher.entity';
import { PublisherRepository } from '../../publisher/repository/publisher.repository';

export interface CreateAdminPublisherCommandData {
	name: string;
	slug: string;
	websiteUrl?: string;
}

@Injectable()
export class CreateAdminPublisherCommand {

	constructor(
		private readonly publisherRepository: PublisherRepository,
	) {}

	async execute(data: CreateAdminPublisherCommandData): Promise<Publisher> {
		const slug = data.slug.trim();
		if (await this.publisherRepository.findOneBy({ slug })) {
			throw new ConflictException('A publisher with this slug already exists.');
		}

		const publisher = this.publisherRepository.create({
			name: data.name.trim(),
			slug,
			websiteUrl: data.websiteUrl?.trim() || undefined,
		});
		await this.publisherRepository.save(publisher);

		return publisher;
	}

}