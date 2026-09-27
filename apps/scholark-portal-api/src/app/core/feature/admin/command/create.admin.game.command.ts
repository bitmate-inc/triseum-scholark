import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { Game } from '../../game/model/game.entity';
import { Publisher } from '../../publisher/model/publisher.entity';

export interface CreateAdminGameCommandData {
	description?: string;
	featured?: boolean;
	publishedAt?: Date;
	publisherId: string;
	slug: string;
	summary?: string;
	title: string;
}

@Injectable()
export class CreateAdminGameCommand {

	constructor(
		@InjectRepository(Game)
		private readonly gameRepository: EntityRepository<Game>,
		@InjectRepository(Publisher)
		private readonly publisherRepository: EntityRepository<Publisher>,
	) {}

	async execute(data: CreateAdminGameCommandData): Promise<Game> {
		const publisher = await this.publisherRepository.findOne({ id: data.publisherId });
		if (!publisher) {
			throw new NotFoundException('Publisher not found.');
		}

		const slug = data.slug.trim();
		if (await this.gameRepository.findOne({ slug })) {
			throw new ConflictException('A game with this slug already exists.');
		}

		const game = this.gameRepository.create({
			description: data.description?.trim() || undefined,
			isFeatured: data.featured,
			publishedAt: data.publishedAt,
			publisher,
			slug,
			summary: data.summary?.trim() || undefined,
			title: data.title.trim(),
		});
		const entityManager = this.gameRepository.getEntityManager();
		entityManager.persist(game);
		await entityManager.flush();

		return game;
	}

}