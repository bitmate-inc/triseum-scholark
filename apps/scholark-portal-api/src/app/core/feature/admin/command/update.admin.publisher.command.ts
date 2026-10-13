import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { Publisher } from '../../publisher/model/publisher.entity';
import { PublisherRepository } from '../../publisher/repository/publisher.repository';

export interface UpdateAdminPublisherCommandData {
	name?: string;
	slug?: string;
	websiteUrl?: string;
}

@Injectable()
export class UpdateAdminPublisherCommand {

	constructor(
		private readonly publisherRepository: PublisherRepository,
	) {}

	async execute(id: string, data: UpdateAdminPublisherCommandData): Promise<Publisher> {
		if (Object.keys(data).length === 0) {
			throw new BadRequestException('At least one publisher field must be provided.');
		}

		const publisher = await this.publisherRepository.findOneBy({ id });
		if (!publisher) {
			throw new NotFoundException('Publisher not found.');
		}

		const slug = data.slug?.trim();
		if (slug && slug !== publisher.slug) {
			const existingPublisher = await this.publisherRepository.findOneBy({ slug });
			if (existingPublisher && existingPublisher.id !== id) {
				throw new ConflictException('A publisher with this slug already exists.');
			}
			publisher.slug = slug;
		}

		if (typeof data.name !== 'undefined') {
			publisher.name = data.name.trim();
		}
		if (typeof data.websiteUrl !== 'undefined') {
			publisher.websiteUrl = data.websiteUrl.trim() || undefined;
		}
		await this.publisherRepository.save(publisher);

		return publisher;
	}

}