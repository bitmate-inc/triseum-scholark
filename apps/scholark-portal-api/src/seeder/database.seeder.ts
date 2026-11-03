import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

import { AcquisitionCode } from '../app/core/feature/education/model/acquisition.code.entity';
import { digestAcquisitionCode, getAcquisitionCodeSuffix } from '../app/core/feature/education/model/acquisition.code.util';
import { Classroom } from '../app/core/feature/education/model/classroom.entity';
import { ClassroomGameGradingRule } from '../app/core/feature/education/model/classroom.game.grading.rule.entity';
import { ClassroomGameListing , ClassroomGameListingDesignatedPayor } from '../app/core/feature/education/model/classroom.game.listing.entity';
import { Course } from '../app/core/feature/education/model/course.entity';
import { GameGradeResult } from '../app/core/feature/education/model/game.grade.result.entity';
import { Institution } from '../app/core/feature/education/model/institution.entity';
import { Instructor } from '../app/core/feature/education/model/instructor.entity';
import { InstructorUser } from '../app/core/feature/education/model/instructor.user.entity';
import { calculateClassroomGameGrade } from '../app/core/feature/education/service/classroom.game.grading.calculator';
import { getGameProgressSnapshotHash } from '../app/core/feature/education/service/game.progress.snapshot.hash';
import { GameAcquisition, GameAcquisitionMechanism } from '../app/core/feature/game/model/game.acquisition.entity';
import {
	GameAcquisitionEvent,
	GameAcquisitionEventActorType,
	GameAcquisitionEventType,
} from '../app/core/feature/game/model/game.acquisition.event.entity';
import { GameCustomization } from '../app/core/feature/game/model/game.customization.entity';
import { Game } from '../app/core/feature/game/model/game.entity';
import { GameLicense } from '../app/core/feature/game/model/game.license.entity';
import { GameProgressSnapshot } from '../app/core/feature/game/model/game.progress.snapshot.entity';
import { GameTaxonomyTerm } from '../app/core/feature/game/model/game.taxonomy.term.entity';
import { GameVersion } from '../app/core/feature/game/model/game.version.entity';
import { PublicGameListing } from '../app/core/feature/game/model/public.game.listing.entity';
import { PublicGameListingPriceGroup } from '../app/core/feature/game/model/public.game.listing.price.group.entity';
import { PublicGameListingPriceGroupLanguage } from '../app/core/feature/game/model/public.game.listing.price.group.language.entity';
import { Publisher } from '../app/core/feature/publisher/model/publisher.entity';
import { TaxonomyTerm } from '../app/core/feature/taxonomy/model/taxonomy.term.entity';
import { User } from '../app/core/feature/user/model/user.entity';
import {
	acquisitionCodeSeedList,
	classroomGameGradingRuleSeedList,
	classroomGameListingSeedList,
	classroomSeedList,
	courseSeedList,
	gameCustomizationSeedList,
	gameProgressSnapshotSeedList,
	gameSeedList,
	gameVersionSeedList,
	institutionSeedList,
	instructorSeedList,
	publicListingSeedList,
	publisherMemberSeedList,
	publisherSeedList,
	userGameLicenseSeedList,
} from './catalog.data';
import type { CatalogSeedData } from './triseum.data';
import { UserSeeder } from './user.seeder';

const USER1_SEED_EMAIL = 'user1@scholark.com';
const USER2_SEED_EMAIL = 'user2@scholark.com';
const USER2_INSTRUCTOR_SEED_SLUG = 'user2-instructor';

export class DatabaseSeeder extends Seeder {

	protected get catalogSeedData(): CatalogSeedData {
		return {
			acquisitionCodeSeedList,
			classroomGameGradingRuleSeedList,
			classroomGameListingSeedList,
			classroomSeedList,
			courseSeedList,
			gameCustomizationSeedList,
			gameProgressSnapshotSeedList,
			gameSeedList,
			gameVersionSeedList,
			institutionSeedList,
			instructorSeedList,
			publicListingSeedList,
			publisherMemberSeedList,
			publisherSeedList,
			userGameLicenseSeedList,
		};
	}

	protected get userSeederClass(): typeof UserSeeder {
		return UserSeeder;
	}

	protected get shouldLinkInstructorUser(): boolean {
		return true;
	}

	async run(em: EntityManager): Promise<void> {
		const {
			acquisitionCodeSeedList,
			classroomGameGradingRuleSeedList,
			classroomGameListingSeedList,
			classroomSeedList,
			courseSeedList,
			gameCustomizationSeedList,
			gameProgressSnapshotSeedList,
			gameSeedList,
			gameVersionSeedList,
			institutionSeedList,
			instructorSeedList,
			publicListingSeedList,
			publisherSeedList,
			userGameLicenseSeedList,
		} = this.catalogSeedData;

		await this.call(em, [this.userSeederClass]);

		const classroomSlugByListingSeedId = new Map<string, string>(
			classroomGameListingSeedList.map(({ classroomSlug, id }): [string, string] => [id, classroomSlug]),
		);
		const user1AcquiredClassroomSlugSet = new Set<string>();
		for (const licenseSeed of userGameLicenseSeedList) {
			if (licenseSeed.email !== USER1_SEED_EMAIL || !licenseSeed.classroomGameListingSeedId) {
				continue;
			}

			const classroomSlug = classroomSlugByListingSeedId.get(licenseSeed.classroomGameListingSeedId);
			if (!classroomSlug) {
				throw new Error(`Missing seeded classroom game listing: ${licenseSeed.classroomGameListingSeedId}`);
			}

			user1AcquiredClassroomSlugSet.add(classroomSlug);
		}
		const user1AcquiredInstitutionSlugSet = new Set(
			classroomSeedList
				.filter(({ slug }) => user1AcquiredClassroomSlugSet.has(slug))
				.map(({ institutionSlug }) => institutionSlug),
		);

		await em.transactional(async (transactionalEm) => {
			const classroomMap = new Map<string, Classroom>();
			const courseMap = new Map<string, Course>();
			const publisherMap = new Map<string, Publisher>();
			const taxonomyTermMap = new Map<string, TaxonomyTerm>();
			const gameMap = new Map<string, Game>();
			const institutionMap = new Map<string, Institution>();
			const instructorMap = new Map<string, Instructor>();
			const gameVersionSeedMap = new Map<string, GameVersion>();
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

				const assignedInstructorSlugSet = new Set(instructorSlugList);
				if (user1AcquiredInstitutionSlugSet.has(institutionSeed.slug)) {
					assignedInstructorSlugSet.add(USER2_INSTRUCTOR_SEED_SLUG);
				}
				institution.instructorList.set(
					[...assignedInstructorSlugSet].map((slug) => instructorMap.get(slug)!),
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
				const assignedInstructorSlugSet = new Set(instructorSlugList);
				if (user1AcquiredClassroomSlugSet.has(classroomSeed.slug)) {
					assignedInstructorSlugSet.add(USER2_INSTRUCTOR_SEED_SLUG);
				}
				classroom.instructorList.set(
					[...assignedInstructorSlugSet].map((slug) => instructorMap.get(slug)!),
				);
				classroom.taxonomyTermList.set(
					taxonomyTermKeyList.map((key) => taxonomyTermMap.get(key)!),
				);
				classroomMap.set(classroom.slug, classroom);
			}

			await transactionalEm.flush();

			if (this.shouldLinkInstructorUser) {
				const instructorUser = await transactionalEm.findOne(User, { email: USER2_SEED_EMAIL });
				const instructor = instructorMap.get(USER2_INSTRUCTOR_SEED_SLUG);
				if (!instructorUser || !instructor) {
					throw new Error(`Missing seeded instructor account or profile: ${USER2_SEED_EMAIL}`);
				}

				const existingUserLink = await transactionalEm.findOne(
					InstructorUser,
					{ user: instructorUser.id! },
					{ populate: ['instructor'] },
				);
				if (existingUserLink && existingUserLink.instructor.id !== instructor.id) {
					throw new Error(`${USER2_SEED_EMAIL} is already linked to a different instructor profile.`);
				}

				if (!existingUserLink) {
					const existingInstructorLink = await transactionalEm.findOne(
						InstructorUser,
						{ instructor: instructor.id! },
						{ populate: ['user'] },
					);
					if (existingInstructorLink && existingInstructorLink.user.id !== instructorUser.id) {
						throw new Error(`${USER2_INSTRUCTOR_SEED_SLUG} is already linked to a different user.`);
					}

					if (!existingInstructorLink) {
						transactionalEm.persist(transactionalEm.create(InstructorUser, { instructor, user: instructorUser }));
					}
				}
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
						progressStructure: gameVersionSeed.progressStructure,
						publisherVersion: gameVersionSeed.publisherVersion,
						runUrl: gameVersionSeed.runUrl,
					});
				} else {
					transactionalEm.assign(gameVersion, {
						description: gameVersionSeed.description,
						publishedAt: gameVersionSeed.publishedAt,
						progressStructure: gameVersionSeed.progressStructure,
						runUrl: gameVersionSeed.runUrl,
					});
				}

				gameVersionSeedMap.set(gameVersionSeed.id, gameVersion);
			}

			await transactionalEm.flush();

			for (const publicListingSeed of publicListingSeedList) {
				const gameVersion = gameVersionSeedMap.get(publicListingSeed.gameVersionSeedId);
				if (!gameVersion) {
					throw new Error(`Missing seeded game version: ${publicListingSeed.gameVersionSeedId}`);
				}

				let publicListing: PublicGameListing | null = await transactionalEm.findOne(
					PublicGameListing,
					{ id: publicListingSeed.id },
					{ populate: ['priceGroupList.languageList'] },
				);
				if (!publicListing) {
					publicListing = transactionalEm.create(PublicGameListing, {
						id: publicListingSeed.id,
						gameVersion,
						isAvailable: true,
						publishedAt: gameVersion.publishedAt,
						startAt: gameVersion.publishedAt,
					});
				} else {
					publicListing.priceGroupList.removeAll();
					transactionalEm.assign(publicListing, {
						endAt: undefined,
						gameVersion,
						isAvailable: true,
						publishedAt: gameVersion.publishedAt,
						startAt: gameVersion.publishedAt,
					});
				}
				for (const priceGroupSeed of publicListingSeed.priceGroupList) {
					const priceGroup = transactionalEm.create(PublicGameListingPriceGroup, {
						price: priceGroupSeed.price,
						publicGameListing: publicListing,
					});
					for (const language of priceGroupSeed.languageList) {
						priceGroup.languageList.add(transactionalEm.create(PublicGameListingPriceGroupLanguage, {
							language,
							priceGroup,
							publicGameListing: publicListing,
						}));
					}
					publicListing.priceGroupList.add(priceGroup);
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
				const gameVersion = gameVersionSeedMap.get(classroomGameListingSeed.gameVersionSeedId);
				const publicListingSeed = publicListingSeedList.find((seed) => seed.gameVersionSeedId === classroomGameListingSeed.gameVersionSeedId);
				if (!gameVersion || !publicListingSeed) {
					throw new Error(`Missing seeded game version or public listing price groups for classroom listing ${classroomGameListingSeed.id}.`);
				}
				const customization = classroomGameListingSeed.customizationSeedId
					? gameCustomizationMap.get(classroomGameListingSeed.customizationSeedId)
					: undefined;
				const classroomPriceGroupSeed = publicListingSeed.priceGroupList.find((priceGroup) =>
					priceGroup.languageList.includes(classroom.language),
				);
				if (classroomGameListingSeed.designatedPayor === ClassroomGameListingDesignatedPayor.STUDENT && !classroomPriceGroupSeed) {
					throw new Error(`No public listing price group matches classroom language ${classroom.language}.`);
				}
				const classroomGameListing = await transactionalEm.findOne(ClassroomGameListing, { id: classroomGameListingSeed.id })
					?? await transactionalEm.findOne(ClassroomGameListing, { classroom, gameVersion });
				const classroomGameListingData = {
					classroom,
					courseType: classroom.courseType,
					customization,
					designatedPayor: classroomGameListingSeed.designatedPayor,
					endAt: new Date('2026-12-31T23:59:59.999Z'),
					gameVersion,
					language: classroom.language,
					licenseDurationDays: 120,
					price: classroomGameListingSeed.designatedPayor === ClassroomGameListingDesignatedPayor.STUDENT && classroomPriceGroupSeed
						? {
							currency: classroomPriceGroupSeed.price.currency,
							minorUnitAmount: Math.round(classroomPriceGroupSeed.price.minorUnitAmount * 0.8),
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
				const publicListing = publicListingSeedMap.get(licenseSeed.publicListingSeedId);
				const classroomGameListing = licenseSeed.classroomGameListingSeedId
					? classroomGameListingSeedMap.get(licenseSeed.classroomGameListingSeedId)
					: undefined;
				const gameVersion = classroomGameListing?.gameVersion
					?? (publicListingSeed ? gameVersionSeedMap.get(publicListingSeed.gameVersionSeedId) : undefined);
				const language = classroomGameListing?.language ?? licenseSeed.language;
				const courseType = classroomGameListing?.courseType ?? 'standard';
				const customization = licenseSeed.customizationSeedId
					? gameCustomizationMap.get(licenseSeed.customizationSeedId)
					: classroomGameListing?.customization;
				const priceGroup = publicListing?.priceGroupList.getItems().find((group) =>
					group.languageList.getItems().some((languageItem) => languageItem.language === language),
				);

				if (!user || !gameVersion || !publicListing || !priceGroup) {
					throw new Error(`Missing seeded user or public listing for license: ${licenseSeed.id}`);
				}

				let gameLicense = await transactionalEm.findOne(GameLicense, { id: licenseSeed.id });
				if (!gameLicense) {
					gameLicense = transactionalEm.create(GameLicense, {
						classroomGameListing,
						customization,
						courseType,
						endAt: licenseSeed.endAt,
						gameVersion,
						id: licenseSeed.id,
						language,
						startAt: licenseSeed.startAt,
						user,
					});
				} else {
					transactionalEm.assign(gameLicense, {
						classroomGameListing,
						customization,
						courseType,
						endAt: licenseSeed.endAt,
						gameVersion,
						language,
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
						price: classroomGameListing?.price ?? priceGroup.price,
						publicListing,
						user,
					});
				}
			}

			await transactionalEm.flush();

			for (const progressSnapshotSeed of gameProgressSnapshotSeedList) {
				const gameLicense = await transactionalEm.findOne(GameLicense, { id: progressSnapshotSeed.gameLicenseSeedId });
				if (!gameLicense) {
					throw new Error(`Missing game license for progress snapshot: ${progressSnapshotSeed.id}`);
				}

				let progressSnapshot = await transactionalEm.findOne(GameProgressSnapshot, { gameLicense });
				if (!progressSnapshot) {
					progressSnapshot = transactionalEm.create(GameProgressSnapshot, {
						content: progressSnapshotSeed.content,
						gameLicense,
						id: progressSnapshotSeed.id,
						schemaVersion: progressSnapshotSeed.schemaVersion,
					});
				} else {
					transactionalEm.assign(progressSnapshot, {
						content: progressSnapshotSeed.content,
						schemaVersion: progressSnapshotSeed.schemaVersion,
					});
				}
				await transactionalEm.flush();
			}

			for (const gradingRuleSeed of classroomGameGradingRuleSeedList) {
				const classroomGameListing = classroomGameListingSeedMap.get(gradingRuleSeed.classroomGameListingSeedId);
				const createdBy = await transactionalEm.findOne(User, { email: gradingRuleSeed.createdByEmail });
				if (!classroomGameListing || !createdBy) {
					throw new Error(`Missing listing or user for grading rule: ${gradingRuleSeed.id}`);
				}

				let gradingRule = await transactionalEm.findOne(ClassroomGameGradingRule, {
					classroomGameListing,
					revision: gradingRuleSeed.revision,
				});
				if (!gradingRule) {
					gradingRule = transactionalEm.create(ClassroomGameGradingRule, {
						classroomGameListing,
						createdBy,
						config: gradingRuleSeed.config,
						id: gradingRuleSeed.id,
						revision: gradingRuleSeed.revision,
					});
				} else {
					transactionalEm.assign(gradingRule, {
						config: gradingRuleSeed.config,
						createdBy,
					});
				}
				await transactionalEm.flush();
			}

			for (const progressSnapshotSeed of gameProgressSnapshotSeedList) {
				const gameLicense = await transactionalEm.findOne(
					GameLicense,
					{ id: progressSnapshotSeed.gameLicenseSeedId },
					{ populate: ['classroomGameListing', 'gameVersion'] },
				);
				const progressSnapshot = gameLicense
					? await transactionalEm.findOne(GameProgressSnapshot, { gameLicense })
					: undefined;
				const gradingRule = gameLicense?.classroomGameListing
					? await transactionalEm.findOne(
						ClassroomGameGradingRule,
						{ classroomGameListing: gameLicense.classroomGameListing },
						{ orderBy: { revision: 'DESC' } },
					)
					: undefined;
				if (!gameLicense || !progressSnapshot || !gradingRule) {
					throw new Error(`Missing grading inputs for progress snapshot: ${progressSnapshotSeed.id}`);
				}

				const sourceProgressHash = getGameProgressSnapshotHash(progressSnapshot.schemaVersion, progressSnapshot.content);
				const resultData = {
					content: calculateClassroomGameGrade(
						progressSnapshot.schemaVersion,
						gameLicense.gameVersion.progressStructure,
						progressSnapshot.content,
						gradingRule.config,
					),
					gameLicense,
					gradingRule,
					progressSnapshot,
					sourceProgressContent: progressSnapshot.content,
					sourceProgressHash,
					sourceProgressUpdatedAt: progressSnapshot.updatedAt!,
				};
				let gradeResult = await transactionalEm.findOne(GameGradeResult, {
					gameLicense,
					gradingRule,
					sourceProgressHash,
				});
				if (!gradeResult) {
					gradeResult = transactionalEm.create(GameGradeResult, resultData);
				} else {
					transactionalEm.assign(gradeResult, resultData);
				}
				await transactionalEm.flush();
			}
		});
	}

}
