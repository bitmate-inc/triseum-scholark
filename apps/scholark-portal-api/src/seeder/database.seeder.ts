import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

import { AcquisitionCode } from '../app/core/feature/education/model/acquisition.code.entity';
import { digestAcquisitionCode, getAcquisitionCodeSuffix } from '../app/core/feature/education/model/acquisition.code.util';
import { Classroom } from '../app/core/feature/education/model/classroom.entity';
import { ClassroomGameListing , ClassroomGameListingDesignatedPayor } from '../app/core/feature/education/model/classroom.game.listing.entity';
import { Course } from '../app/core/feature/education/model/course.entity';
import { Institution } from '../app/core/feature/education/model/institution.entity';
import { Instructor } from '../app/core/feature/education/model/instructor.entity';
import { GameAcquisition, GameAcquisitionMechanism } from '../app/core/feature/game/model/game.acquisition.entity';
import {
	GameAcquisitionEvent,
	GameAcquisitionEventActorType,
	GameAcquisitionEventType,
} from '../app/core/feature/game/model/game.acquisition.event.entity';
import { GameCustomization } from '../app/core/feature/game/model/game.customization.entity';
import { Game } from '../app/core/feature/game/model/game.entity';
import { GameLicense } from '../app/core/feature/game/model/game.license.entity';
import { GameTaxonomyTerm } from '../app/core/feature/game/model/game.taxonomy.term.entity';
import { GameVariant, GameVariantMode } from '../app/core/feature/game/model/game.variant.entity';
import { GameVersion } from '../app/core/feature/game/model/game.version.entity';
import { PublicGameListing } from '../app/core/feature/game/model/public.game.listing.entity';
import { Publisher } from '../app/core/feature/publisher/model/publisher.entity';
import { TaxonomyTerm } from '../app/core/feature/taxonomy/model/taxonomy.term.entity';
import { User } from '../app/core/feature/user/model/user.entity';
import {
	acquisitionCodeSeedList,
	classroomGameListingSeedList,
	classroomSeedList,
	courseSeedList,
	gameCustomizationSeedList,
	gameSeedList,
	gameVersionSeedList,
	institutionSeedList,
	instructorSeedList,
	publicListingSeedList,
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
			const publicListingSeedMap = new Map<string, PublicGameListing>();
			const gameCustomizationMap = new Map<string, GameCustomization>();
			const classroomGameListingSeedMap = new Map<string, ClassroomGameListing>();

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

			// Each public listing seed targets a distinct language variant, always on the default mode.
			for (const publicListingSeed of publicListingSeedList) {
				const gameVariantKey = `${publicListingSeed.gameVersionSeedId}:${publicListingSeed.language}`;
				if (gameVariantSeedMap.has(gameVariantKey)) {
					continue;
				}

				const gameVersion = gameVersionSeedMap.get(publicListingSeed.gameVersionSeedId)!;
				let gameVariant = await transactionalEm.findOne(GameVariant, {
					gameVersion,
					language: publicListingSeed.language,
					mode: GameVariantMode.DEFAULT,
				});
				if (!gameVariant) {
					gameVariant = transactionalEm.create(GameVariant, {
						gameVersion,
						language: publicListingSeed.language,
						mode: GameVariantMode.DEFAULT,
					});
				}
				gameVariantSeedMap.set(gameVariantKey, gameVariant);
			}

			for (const publicListingSeed of publicListingSeedList) {
				const gameVariantKey = `${publicListingSeed.gameVersionSeedId}:${publicListingSeed.language}`;
				const gameVariant = gameVariantSeedMap.get(gameVariantKey);
				if (!gameVariant) {
					throw new Error(`Missing seeded game variant: ${gameVariantKey}`);
				}

				let publicListing = await transactionalEm.findOne(PublicGameListing, { id: publicListingSeed.id });
				if (!publicListing) {
					publicListing = transactionalEm.create(PublicGameListing, {
						id: publicListingSeed.id,
						gameVariant,
						isAvailable: true,
						price: publicListingSeed.price,
						publishedAt: gameVariant.gameVersion.publishedAt,
					});
				} else {
					transactionalEm.assign(publicListing, {
						gameVariant,
						isAvailable: true,
						price: publicListingSeed.price,
						publishedAt: gameVariant.gameVersion.publishedAt,
					});
				}
				publicListingSeedMap.set(publicListingSeed.id, publicListing);
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

			for (const classroomGameListingSeed of classroomGameListingSeedList) {
				const classroom = classroomMap.get(classroomGameListingSeed.classroomSlug)!;
				const publicListing = publicListingSeedMap.get(classroomGameListingSeed.publicListingSeedId);
				if (!publicListing) {
					throw new Error(`Missing seeded public listing for classroom listing ${classroomGameListingSeed.id}.`);
				}
				const customization = classroomGameListingSeed.customizationSeedId
					? gameCustomizationMap.get(classroomGameListingSeed.customizationSeedId)
					: undefined;
				const classroomGameListing = await transactionalEm.findOne(ClassroomGameListing, { id: classroomGameListingSeed.id })
					?? await transactionalEm.findOne(ClassroomGameListing, { classroom, gameVariant: publicListing.gameVariant });
				const classroomGameListingData = {
					classroom,
					customization,
					designatedPayor: classroomGameListingSeed.designatedPayor,
					endAt: new Date('2026-12-31T23:59:59.999Z'),
					gameVariant: publicListing.gameVariant,
					licenseDurationDays: 120,
					price: classroomGameListingSeed.designatedPayor === ClassroomGameListingDesignatedPayor.STUDENT
						? {
							currency: publicListing.price.currency,
							minorUnitAmount: Math.round(publicListing.price.minorUnitAmount * 0.8),
						}
						: undefined,
					publishedAt: new Date(),
					startAt: new Date('2026-01-01T00:00:00.000Z'),
				};

				if (!classroomGameListing) {
					const createdClassroomGameListing = transactionalEm.create(ClassroomGameListing, {
						...classroomGameListingData,
						id: classroomGameListingSeed.id,
					});
					classroomGameListingSeedMap.set(classroomGameListingSeed.id, createdClassroomGameListing);
				} else {
					transactionalEm.assign(classroomGameListing, classroomGameListingData);
					classroomGameListingSeedMap.set(classroomGameListingSeed.id, classroomGameListing);
				}
			}

			await transactionalEm.flush();

			for (const acquisitionCodeSeed of acquisitionCodeSeedList) {
				const classroomGameListing = classroomGameListingSeedMap.get(acquisitionCodeSeed.classroomGameListingSeedId);
				if (!classroomGameListing) {
					throw new Error(`Missing seeded classroom game listing for acquisition code: ${acquisitionCodeSeed.code}`);
				}

				const codeDigest = digestAcquisitionCode(acquisitionCodeSeed.code);
				const acquisitionCode = await transactionalEm.findOne(AcquisitionCode, { codeDigest });
				if (!acquisitionCode) {
					transactionalEm.create(AcquisitionCode, {
						codeDigest,
						codeSuffix: getAcquisitionCodeSuffix(acquisitionCodeSeed.code),
						classroomGameListing,
						expiresAt: acquisitionCodeSeed.expiresAt,
					});
				} else {
					transactionalEm.assign(acquisitionCode, {
						classroomGameListing,
						expiresAt: acquisitionCodeSeed.expiresAt,
					});
				}
			}

			await transactionalEm.flush();

			for (const acquisitionCodeSeed of acquisitionCodeSeedList) {
				const codeDigest = digestAcquisitionCode(acquisitionCodeSeed.code);
				const acquisitionCode = await transactionalEm.findOne(AcquisitionCode, { codeDigest });
				if (!acquisitionCode) {
					throw new Error(`Missing seeded acquisition code: ${acquisitionCodeSeed.code}`);
				}

				const issuanceEvent = await transactionalEm.findOne(GameAcquisitionEvent, {
					acquisitionCode,
					eventType: GameAcquisitionEventType.CODE_ISSUED,
				});
				if (!issuanceEvent) {
					transactionalEm.create(GameAcquisitionEvent, {
						acquisitionCode,
						actorType: GameAcquisitionEventActorType.SYSTEM,
						eventType: GameAcquisitionEventType.CODE_ISSUED,
						metadata: {
							classroomGameListingId: acquisitionCodeSeed.classroomGameListingSeedId,
							expiresAt: acquisitionCodeSeed.expiresAt.toISOString(),
							source: 'seeder',
						},
					});
				}
			}

			await transactionalEm.flush();

			for (const licenseSeed of userGameLicenseSeedList) {
				const user = await transactionalEm.findOne(User, { email: licenseSeed.email });
				const publicListingSeed = publicListingSeedList.find((seed) => seed.id === licenseSeed.publicListingSeedId);
				const gameVariant = publicListingSeed
					? gameVariantSeedMap.get(`${publicListingSeed.gameVersionSeedId}:${publicListingSeed.language}`)
					: undefined;
				const publicListing = publicListingSeedMap.get(licenseSeed.publicListingSeedId);
				const customization = licenseSeed.customizationSeedId
					? gameCustomizationMap.get(licenseSeed.customizationSeedId)
					: undefined;
				const classroomGameListing = licenseSeed.classroomGameListingSeedId
					? classroomGameListingSeedMap.get(licenseSeed.classroomGameListingSeedId)
					: undefined;

				if (!user || !gameVariant || !publicListing) {
					throw new Error(`Missing seeded user or public listing for license: ${licenseSeed.id}`);
				}

				let gameLicense = await transactionalEm.findOne(GameLicense, { id: licenseSeed.id });
				if (!gameLicense) {
					gameLicense = transactionalEm.create(GameLicense, {
						classroomGameListing,
						customization,
						endAt: licenseSeed.endAt,
						gameVariant,
						id: licenseSeed.id,
						startAt: licenseSeed.startAt,
						user,
					});
				} else {
					transactionalEm.assign(gameLicense, {
						classroomGameListing,
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
						classroomGameListing,
						license: gameLicense,
						mechanism: GameAcquisitionMechanism.COMPLIMENTARY,
						price: publicListing.price,
						publicListing,
						user,
					});
				}
			}
		});
	}

}
