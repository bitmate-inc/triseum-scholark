import { EntityRepository } from '@mikro-orm/postgresql';

import { Game } from '../../game/model/game.entity';
import { GameVersion } from '../../game/model/game.version.entity';

export const DIACRITIC_CHARACTER_LIST = 'áàâäãåāăąçćčďđéèêëēėęěğíìîïīįłñńňóòôöõøōőřśšşťúùûüūůűýÿžźż';
export const ASCII_CHARACTER_LIST = 'aaaaaaaaacccddeeeeeeeegiiiiiilnnnoooooooorssstuuuuuuuyyzzz';

export function normalizeCatalogSearchQuery(searchQuery: string): string {
	return searchQuery
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLocaleLowerCase();
}

export async function loadGamePrice(gameList: Game[], gameVersionRepository: EntityRepository<GameVersion>) {
	// fetch prices by game from gme version
	const priceList = await gameVersionRepository
		.createQueryBuilder('gameVersion')
		.select([
			'gameVersion.id',
			'gameVersion.game',
			'gameVersion.price',
		])
		.where({
			game: { id: { $in: gameList.map((game) => game.id!) } },
			publishedAt: { $lte: new Date() },
		})
		.distinctOn(['gameVersion.game'])
		.orderBy({
			game: 'ASC',
			publishedAt: 'DESC',
		})
		.getResultList();

	const priceByGameId = new Map(
		priceList.map((version) => [version.game.id, version.price]),
	);

	// set prices
	for (const game of gameList) {
		game.price = priceByGameId.get(game.id);
	}
}