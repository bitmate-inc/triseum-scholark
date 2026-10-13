import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { Game } from '../../game/model/game.entity';
import { GameRepository } from '../../game/repository/game.repository';

export interface UpdateAdminGameCommandData {
	description?: string;
	featured?: boolean;
	publishedAt?: Date | null;
	slug?: string;
	summary?: string;
	title?: string;
}

@Injectable()
export class UpdateAdminGameCommand {

	constructor(
		private readonly gameRepository: GameRepository,
	) {}

	async execute(id: string, data: UpdateAdminGameCommandData): Promise<Game> {
		if (Object.keys(data).length === 0) {
			throw new BadRequestException('At least one game field must be provided.');
		}

		const game = await this.gameRepository.findOneBy({ id }, { relations: { publisher: true } });
		if (!game) {
			throw new NotFoundException('Game not found.');
		}
		if (game.isPublished()) {
			throw new ConflictException('Published games are immutable.');
		}

		const slug = data.slug?.trim();
		if (slug && slug !== game.slug) {
			const existingGame = await this.gameRepository.findOneBy({ slug });
			if (existingGame && existingGame.id !== id) {
				throw new ConflictException('A game with this slug already exists.');
			}
			game.slug = slug;
		}

		if (typeof data.title !== 'undefined') {
			game.title = data.title.trim();
		}
		if (typeof data.summary !== 'undefined') {
			game.summary = data.summary.trim() || undefined;
		}
		if (typeof data.description !== 'undefined') {
			game.description = data.description.trim() || undefined;
		}
		if (typeof data.featured !== 'undefined') {
			game.isFeatured = data.featured;
		}
		if (Object.prototype.hasOwnProperty.call(data, 'publishedAt')) {
			game.publishedAt = data.publishedAt ?? undefined;
		}

		await this.gameRepository.save(game);
		return game;
	}

}