import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

import { Classroom } from '../app/core/feature/education/model/classroom.entity';
import { ClassroomGame } from '../app/core/feature/education/model/classroom.game.entity';
import { Course } from '../app/core/feature/education/model/course.entity';
import { InstitutionContract } from '../app/core/feature/education/model/institution.contract.entity';
import { InstitutionContractGameOffer } from '../app/core/feature/education/model/institution.contract.game.offer.entity';
import { Institution } from '../app/core/feature/education/model/institution.entity';
import { Instructor } from '../app/core/feature/education/model/instructor.entity';
import { GameAcquisition, GameAcquisitionMechanism } from '../app/core/feature/game/model/game.acquisition.entity';
import { GameCustomization } from '../app/core/feature/game/model/game.customization.entity';
import { Game } from '../app/core/feature/game/model/game.entity';
import { GameLicense } from '../app/core/feature/game/model/game.license.entity';
import { GameTaxonomyTerm } from '../app/core/feature/game/model/game.taxonomy.term.entity';
import { GameVariant, GameVariantMode } from '../app/core/feature/game/model/game.variant.entity';
import { GameVersion } from '../app/core/feature/game/model/game.version.entity';
import { PublicGameOffer } from '../app/core/feature/game/model/public.game.offer.entity';
import { Publisher } from '../app/core/feature/publisher/model/publisher.entity';
import { TaxonomyTerm } from '../app/core/feature/taxonomy/model/taxonomy.term.entity';
import { User } from '../app/core/feature/user/model/user.entity';
import {
	classroomGameSeedList,
	classroomSeedList,
	courseSeedList,
	gameCustomizationSeedList,
	gameSeedList,
	gameVersionSeedList,
	institutionContractSeedList,
	institutionSeedList,
	instructorSeedList,
	publicOfferSeedList,
	publisherSeedList,
	userGameLicenseSeedList,
} from './catalog.data';
import { UserSeeder } from './user.seeder';

export class DatabaseSeeder extends Seeder {

	async run(em: EntityManager): Promise<void> {
		await this.call(em, [UserSeeder]);

		await em.transactional(async (transactionalEm) => {
			const classroomMap = new Map<string, Classroom>();
			const courseMap = new Map<string, Course>();
			const publisherMap = new Map<string, Publisher>();
			const taxonomyTermMap = new Map<string, TaxonomyTerm>();
			const gameMap = new Map<string, Game>();
			const institutionMap = new Map<string, Institution>();
			const instructorMap = new Map<string, Instructor>();
			const gameVersionSeedMap = new Map<string, GameVersion>();
			const gameVariantSeedMap = new Map<string, GameVariant>();
			const publicOfferSeedMap = new Map<string, PublicGameOffer>();
			const gameCustomizationMap = new Map<string, GameCustomization>();
			const classroomGameSeedMap = new Map<string, ClassroomGame>();
			const institutionContractGameOfferMap = new Map<string, InstitutionContractGameOffer>();
			const contractMap = new Map<string, InstitutionContract>();

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
					publisher: publisherMap.get(gameSeed.publisherSlugList[0])!,
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

			for (const instructorSeed of instructorSeedList) {
				let instructor = await transactionalEm.findOne(Instructor, { slug: instructorSeed.slug });

				if (instructor) {
					transactionalEm.assign(instructor, instructorSeed);
				} else {
					instructor = transactionalEm.create(Instructor, instructorSeed);
				}

				instructorMap.set(instructor.slug, instructor);
			}

			for (const institutionSeed of institutionSeedList) {
				const { instructorSlugList, ...institutionData } = institutionSeed;
				let institution = await transactionalEm.findOne(Institution, {
					slug: institutionSeed.slug,
				});

				if (institution) {
					transactionalEm.assign(institution, institutionData);
				} else {
					institution = transactionalEm.create(Institution, institutionData);
				}

				institution.instructorList.set(
					instructorSlugList.map((slug) => instructorMap.get(slug)!),
				);

				institutionMap.set(institution.slug, institution);
			}

			for (const courseSeed of courseSeedList) {
				const { institutionSlug, ...courseData } = courseSeed;
				const institution = institutionMap.get(institutionSlug)!;
				let course = await transactionalEm.findOne(Course, { slug: courseSeed.slug });

				if (course) {
					transactionalEm.assign(course, { ...courseData, institution });
				} else {
					course = transactionalEm.create(Course, { ...courseData, institution });
				}

				courseMap.set(course.slug, course);
			}

			for (const classroomSeed of classroomSeedList) {
				const {
					courseSlugList,
					institutionSlug,
					instructorSlugList,
					taxonomyTermKeyList,
					...classroomData
				} = classroomSeed;
				const institution = institutionMap.get(institutionSlug)!;
				let classroom = await transactionalEm.findOne(Classroom, { slug: classroomSeed.slug });

				if (classroom) {
					transactionalEm.assign(classroom, { ...classroomData, institution });
				} else {
					classroom = transactionalEm.create(Classroom, { ...classroomData, institution });
				}

				classroom.courseList.set(courseSlugList.map((slug) => courseMap.get(slug)!));
				classroom.instructorList.set(
					instructorSlugList.map((slug) => instructorMap.get(slug)!),
				);
				classroom.taxonomyTermList.set(
					taxonomyTermKeyList.map((key) => taxonomyTermMap.get(key)!),
				);
				classroomMap.set(classroom.slug, classroom);
			}

			await transactionalEm.flush();

			for (const gameVersionSeed of gameVersionSeedList) {
				const game = gameMap.get(gameVersionSeed.gameSlug)!;
				let gameVersion = await transactionalEm.findOne(GameVersion, {
					game,
					publisherVersion: gameVersionSeed.publisherVersion,
				});

				if (!gameVersion) {
					gameVersion = transactionalEm.create(GameVersion, {
						id: gameVersionSeed.id,
						game,
						description: gameVersionSeed.description,
						publishedAt: gameVersionSeed.publishedAt,
						publisherVersion: gameVersionSeed.publisherVersion,
						runUrl: gameVersionSeed.runUrl,
					});
				} else {
					transactionalEm.assign(gameVersion, {
						description: gameVersionSeed.description,
						publishedAt: gameVersionSeed.publishedAt,
						runUrl: gameVersionSeed.runUrl,
					});
				}

				gameVersionSeedMap.set(gameVersionSeed.id, gameVersion);
			}

			await transactionalEm.flush();

			// Each public offer seed targets a distinct language variant, always on the default mode.
			for (const publicOfferSeed of publicOfferSeedList) {
				const gameVariantKey = `${publicOfferSeed.gameVersionSeedId}:${publicOfferSeed.language}`;
				if (gameVariantSeedMap.has(gameVariantKey)) {
					continue;
				}

				const gameVersion = gameVersionSeedMap.get(publicOfferSeed.gameVersionSeedId)!;
				let gameVariant = await transactionalEm.findOne(GameVariant, {
					gameVersion,
					language: publicOfferSeed.language,
					mode: GameVariantMode.DEFAULT,
				});
				if (!gameVariant) {
					gameVariant = transactionalEm.create(GameVariant, {
						gameVersion,
						language: publicOfferSeed.language,
						mode: GameVariantMode.DEFAULT,
					});
				}
				gameVariantSeedMap.set(gameVariantKey, gameVariant);
			}

			for (const publicOfferSeed of publicOfferSeedList) {
				const gameVariantKey = `${publicOfferSeed.gameVersionSeedId}:${publicOfferSeed.language}`;
				const gameVariant = gameVariantSeedMap.get(gameVariantKey);
				if (!gameVariant) {
					throw new Error(`Missing seeded game variant: ${gameVariantKey}`);
				}

				let publicOffer = await transactionalEm.findOne(PublicGameOffer, { id: publicOfferSeed.id });
				if (!publicOffer) {
					publicOffer = transactionalEm.create(PublicGameOffer, {
						id: publicOfferSeed.id,
						gameVariant,
						isAvailable: true,
						price: publicOfferSeed.price,
						publishedAt: gameVariant.gameVersion.publishedAt,
					});
				} else {
					transactionalEm.assign(publicOffer, {
						gameVariant,
						isAvailable: true,
						price: publicOfferSeed.price,
						publishedAt: gameVariant.gameVersion.publishedAt,
					});
				}
				publicOfferSeedMap.set(publicOfferSeed.id, publicOffer);
			}

			await transactionalEm.flush();

			for (const customizationSeed of gameCustomizationSeedList) {
				const gameVersion = gameVersionSeedMap.get(customizationSeed.gameVersionSeedId);
				if (!gameVersion) {
					throw new Error(`Missing seeded game version: ${customizationSeed.gameVersionSeedId}`);
				}

				let customization = await transactionalEm.findOne(GameCustomization, {
					id: customizationSeed.id,
				});
				if (customization) {
					transactionalEm.assign(customization, {
						content: customizationSeed.content,
						gameVersion,
						publishedAt: customizationSeed.publishedAt,
					});
				} else {
					customization = transactionalEm.create(GameCustomization, {
						content: customizationSeed.content,
						gameVersion,
						id: customizationSeed.id,
						publishedAt: customizationSeed.publishedAt,
					});
				}

				gameCustomizationMap.set(customizationSeed.id, customization);
			}

			await transactionalEm.flush();

			for (const contractSeed of institutionContractSeedList) {
				const institution = institutionMap.get(contractSeed.institutionSlug)!;
				let contract = await transactionalEm.findOne(InstitutionContract, {
					id: contractSeed.id,
				});

				if (contract) {
					transactionalEm.assign(contract, {
						designatedPayor: contractSeed.designatedPayor,
						endAt: contractSeed.endAt,
						institution,
						startAt: contractSeed.startAt,
						status: contractSeed.status,
						type: contractSeed.type,
					});
				} else {
					contract = transactionalEm.create(InstitutionContract, {
						designatedPayor: contractSeed.designatedPayor,
						endAt: contractSeed.endAt,
						id: contractSeed.id,
						institution,
						startAt: contractSeed.startAt,
						status: contractSeed.status,
						type: contractSeed.type,
					});
				}
				contractMap.set(institution.slug, contract);

				await transactionalEm.flush();

				for (const institutionContractGameOfferSeed of contractSeed.institutionContractGameOfferList) {
					const publicOffer = publicOfferSeedMap.get(institutionContractGameOfferSeed.publicOfferSeedId)!;
					let institutionContractGameOffer = await transactionalEm.findOne(InstitutionContractGameOffer, { contract, gameVariant: publicOffer.gameVariant });
					if (!institutionContractGameOffer) {
						institutionContractGameOffer = transactionalEm.create(InstitutionContractGameOffer, {
							contract,
							gameVariant: publicOffer.gameVariant,
							licenseDurationDays: institutionContractGameOfferSeed.licenseDurationDays,
							price: institutionContractGameOfferSeed.price,
						});
					} else {
						transactionalEm.assign(institutionContractGameOffer, {
							licenseDurationDays: institutionContractGameOfferSeed.licenseDurationDays,
							price: institutionContractGameOfferSeed.price,
						});
					}
					institutionContractGameOfferMap.set(`${institution.slug}:${institutionContractGameOfferSeed.publicOfferSeedId}`, institutionContractGameOffer);
				}
			}

			await transactionalEm.flush();

			for (const classroomGameSeed of classroomGameSeedList) {
				const classroom = classroomMap.get(classroomGameSeed.classroomSlug)!;
				const institutionContractGameOffer = institutionContractGameOfferMap.get(
					`${classroom.institution.slug}:${classroomGameSeed.publicOfferSeedId}`,
				);
				if (!institutionContractGameOffer) {
					throw new Error(
						`Missing seeded institution game offer for classroom ${classroomGameSeed.id}: ${classroom.institution.slug}:${classroomGameSeed.publicOfferSeedId}`,
					);
				}
				const customization = classroomGameSeed.customizationSeedId
					? gameCustomizationMap.get(classroomGameSeed.customizationSeedId)
					: undefined;
				const classroomGame = await transactionalEm.findOne(ClassroomGame, { id: classroomGameSeed.id })
					?? await transactionalEm.findOne(ClassroomGame, { classroom, contractGameOffer: institutionContractGameOffer });

				if (!classroomGame) {
					const createdClassroomGame = transactionalEm.create(ClassroomGame, {
						classroom,
						contractGameOffer: institutionContractGameOffer,
						customization,
						startAt: new Date('2026-01-01T00:00:00.000Z'),
						endAt: new Date('2026-12-31T23:59:59.999Z'),
						id: classroomGameSeed.id,
						publishedAt: new Date(),
					});
					classroomGameSeedMap.set(classroomGameSeed.id, createdClassroomGame);
				} else {
					transactionalEm.assign(classroomGame, {
						contractGameOffer: institutionContractGameOffer,
						customization,
						startAt: new Date('2026-01-01T00:00:00.000Z'),
						endAt: new Date('2026-12-31T23:59:59.999Z'),
					});
					classroomGameSeedMap.set(classroomGameSeed.id, classroomGame);
				}
			}

			await transactionalEm.flush();

			for (const licenseSeed of userGameLicenseSeedList) {
				const user = await transactionalEm.findOne(User, { email: licenseSeed.email });
				const publicOfferSeed = publicOfferSeedList.find((seed) => seed.id === licenseSeed.publicOfferSeedId);
				const gameVariant = publicOfferSeed
					? gameVariantSeedMap.get(`${publicOfferSeed.gameVersionSeedId}:${publicOfferSeed.language}`)
					: undefined;
				const publicOffer = publicOfferSeedMap.get(licenseSeed.publicOfferSeedId);
				const customization = licenseSeed.customizationSeedId
					? gameCustomizationMap.get(licenseSeed.customizationSeedId)
					: undefined;
				const classroomGame = licenseSeed.classroomGameSeedId
					? classroomGameSeedMap.get(licenseSeed.classroomGameSeedId)
					: undefined;

				if (!user || !gameVariant || !publicOffer) {
					throw new Error(`Missing seeded user or public offer for license: ${licenseSeed.id}`);
				}

				let gameLicense = await transactionalEm.findOne(GameLicense, { id: licenseSeed.id });
				if (!gameLicense) {
					gameLicense = transactionalEm.create(GameLicense, {
						classroomGame,
						customization,
						endAt: licenseSeed.endAt,
						gameVariant,
						id: licenseSeed.id,
						startAt: licenseSeed.startAt,
						user,
					});
				} else {
					transactionalEm.assign(gameLicense, {
						classroomGame,
						customization,
						endAt: licenseSeed.endAt,
						gameVariant,
						startAt: licenseSeed.startAt,
						user,
					});
				}

				await transactionalEm.flush();

				const existingAcquisition = await transactionalEm.findOne(GameAcquisition, { license: gameLicense });
				if (!existingAcquisition) {
					transactionalEm.create(GameAcquisition, {
						license: gameLicense,
						mechanism: GameAcquisitionMechanism.COMPLIMENTARY,
						price: publicOffer.price,
						publicOffer,
						user,
					});
				}
			}
		});
	}

}
