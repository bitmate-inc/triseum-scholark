import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

import { Game } from '../app/core/feature/game/model/game.entity';
import { GameTaxonomyTerm } from '../app/core/feature/game/model/game.taxonomy.term.entity';
import { Publisher } from '../app/core/feature/publisher/model/publisher.entity';
import { TaxonomyTerm } from '../app/core/feature/taxonomy/model/taxonomy.term.entity';
import { gameSeedList, publisherSeedList } from './catalog.data';
import { UserSeeder } from './user.seeder';

export class DatabaseSeeder extends Seeder {

	async run(em: EntityManager): Promise<void> {
		await this.call(em, [UserSeeder]);

		await em.transactional(async (transactionalEm) => {
			const publisherMap = new Map<string, Publisher>();
			const taxonomyTermMap = new Map<string, TaxonomyTerm>();
			const gameMap = new Map<string, Game>();

			for (const publisherSeed of publisherSeedList) {
				let publisher = await transactionalEm.findOne(Publisher, { slug: publisherSeed.slug });

				if (publisher) {
					transactionalEm.assign(publisher, publisherSeed);
				} else {
					publisher = transactionalEm.create(Publisher, publisherSeed);
				}

				publisherMap.set(publisher.slug, publisher);
			}

			for (const gameSeed of gameSeedList) {
				for (const taxonomySeed of gameSeed.taxonomyList) {
					const key = `${taxonomySeed.type}:${taxonomySeed.slug}`;
					if (taxonomyTermMap.has(key)) {
						continue;
					}

					let taxonomyTerm = await transactionalEm.findOne(TaxonomyTerm, {
						slug: taxonomySeed.slug,
						type: taxonomySeed.type,
					});

					if (taxonomyTerm) {
						transactionalEm.assign(taxonomyTerm, { label: taxonomySeed.label });
					} else {
						taxonomyTerm = transactionalEm.create(TaxonomyTerm, {
							id: taxonomySeed.id,
							label: taxonomySeed.label,
							slug: taxonomySeed.slug,
							type: taxonomySeed.type,
						});
					}

					taxonomyTermMap.set(key, taxonomyTerm);
				}

				const gameData = {
					cover: gameSeed.cover,
					description: gameSeed.description,
					estimatedLengthMinutesMax: gameSeed.estimatedLengthMinutesMax,
					estimatedLengthMinutesMin: gameSeed.estimatedLengthMinutesMin,
					id: gameSeed.id,
					isFeatured: gameSeed.isFeatured,
					mediaList: gameSeed.mediaList,
					publishedAt: gameSeed.publishedAt,
					slug: gameSeed.slug,
					summary: gameSeed.summary,
					title: gameSeed.title,
				};
				let game = await transactionalEm.findOne(Game, { slug: gameSeed.slug });

				if (game) {
					transactionalEm.assign(game, gameData);
				} else {
					game = transactionalEm.create(Game, gameData);
				}

				game.publisherList.set(
					gameSeed.publisherSlugList.map((slug) => publisherMap.get(slug)!),
				);

				gameMap.set(game.slug, game);
			}

			await transactionalEm.flush();

			for (const gameSeed of gameSeedList) {
				const game = gameMap.get(gameSeed.slug)!;
				await transactionalEm.nativeDelete(GameTaxonomyTerm, { gameId: game.id! });

				for (const taxonomySeed of gameSeed.taxonomyList) {
					const taxonomyTerm = taxonomyTermMap.get(
						`${taxonomySeed.type}:${taxonomySeed.slug}`,
					)!;

					transactionalEm.create(GameTaxonomyTerm, {
						gameId: game.id!,
						isPrimary: taxonomySeed.isPrimary,
						sortOrder: taxonomySeed.sortOrder,
						taxonomyTerm,
					});
				}
			}

			await transactionalEm.flush();
		});
	}

}