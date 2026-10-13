import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { Game } from '../../game/model/game.entity';
import { GameRepository } from '../../game/repository/game.repository';
import { PublisherRepository } from '../../publisher/repository/publisher.repository';

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
		private readonly gameRepository: GameRepository,
		private readonly publisherRepository: PublisherRepository,
	) {}

	async execute(data: CreateAdminGameCommandData): Promise<Game> {
		const publisher = await this.publisherRepository.findOneBy({ id: data.publisherId });
		if (!publisher) {
			throw new NotFoundException('Publisher not found.');
		}

		const slug = data.slug.trim();
		if (await this.gameRepository.findOneBy({ slug })) {
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
		await this.gameRepository.save(game);

		return game;
	}

}