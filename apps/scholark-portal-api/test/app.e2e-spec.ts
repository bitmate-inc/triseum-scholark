import { MikroORM } from '@mikro-orm/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AcquisitionCode } from '../src/app/core/feature/education/model/acquisition.code.entity';
import { AcquisitionCodeRedemption } from '../src/app/core/feature/education/model/acquisition.code.redemption.entity';
import { digestAcquisitionCode, getAcquisitionCodeSuffix } from '../src/app/core/feature/education/model/acquisition.code.util';
import { Classroom } from '../src/app/core/feature/education/model/classroom.entity';
import { ClassroomGame } from '../src/app/core/feature/education/model/classroom.game.entity';
import { EducationCatalogStatus } from '../src/app/core/feature/education/model/education.catalog.status';
import { Institution } from '../src/app/core/feature/education/model/institution.entity';
import { InstitutionGameOffer, InstitutionGameOfferDesignatedPayor } from '../src/app/core/feature/education/model/institution.game.offer.entity';
import { GameAcquisition } from '../src/app/core/feature/game/model/game.acquisition.entity';
import { GameAcquisitionEvent } from '../src/app/core/feature/game/model/game.acquisition.event.entity';
import { User } from '../src/app/core/feature/user/model/user.entity';
import { RedisExpressSessionRevoker } from '../src/app/core/infrastructure/auth/transport/express-session/redis.express-session.revoker';
import { configureApp } from '../src/app/server';
import { WwwModule } from './../src/app/www/www.module';

describe('AppController (e2e)', () => {
	let app: NestExpressApplication;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [WwwModule],
		}).compile();

		app = moduleFixture.createNestApplication<NestExpressApplication>();
		await configureApp(app);
		await app.init();
	});

	it('/api/v1/health/alive (GET)', () => {
		return request(app.getHttpServer())
			.get('/api/v1/health/alive')
			.expect(200)
			.expect('');
	});

	it('registers the acquisition event entity prototype', () => {
		const metadata = app.get(MikroORM).getMetadata().get(GameAcquisitionEvent);
		expect(metadata.class).toBe(GameAcquisitionEvent);
	});

	it('searches billing records by game title', async () => {
		const agent = request.agent(app.getHttpServer());
		await agent
			.post('/api/v1/auth/login')
			.send({ email: 'user1@scholark.com', password: 'password' })
			.expect(200);

		const acquisitionResponse = await agent
			.get('/api/v1/admin/billing/acquisitions')
			.query({ q: 'Econland' })
			.expect(200);
		expect(acquisitionResponse.body.acquisitionList).toEqual(
			expect.arrayContaining([expect.objectContaining({ gameTitle: 'Econland' })]),
		);

		const paymentAttemptResponse = await agent
			.get('/api/v1/admin/billing/payment-attempts')
			.query({ q: 'Econland' })
			.expect(200);
		expect(paymentAttemptResponse.body).toHaveProperty('paymentAttemptList');

		const licenseResponse = await agent
			.get('/api/v1/admin/billing/licenses')
			.query({ q: 'Econland' })
			.expect(200);
		expect(licenseResponse.body.licenseList).toEqual(
			expect.arrayContaining([expect.objectContaining({ gameTitle: 'Econland' })]),
		);
	});

	it('lists acquisition codes with their redeemer details', async () => {
		const agent = request.agent(app.getHttpServer());
		await agent
			.post('/api/v1/auth/login')
			.send({ email: 'user1@scholark.com', password: 'password' })
			.expect(200);

		const entityManager = app.get(MikroORM).em.fork();
		const institutionGameOffer = await entityManager.findOne(InstitutionGameOffer, {
			designatedPayor: InstitutionGameOfferDesignatedPayor.INSTITUTION,
		});
		const classroomGame = institutionGameOffer
			? await entityManager.findOne(ClassroomGame, { institutionGameOffer })
			: undefined;
		const user = await entityManager.findOne(User, { email: 'user1@scholark.com' });
		expect(institutionGameOffer).toBeDefined();
		expect(classroomGame).toBeDefined();
		expect(user).toBeDefined();
		const rawCode = `E2E-${Date.now()}`;
		const code = entityManager.create(AcquisitionCode, {
			codeDigest: digestAcquisitionCode(rawCode),
			codeSuffix: getAcquisitionCodeSuffix(rawCode),
			classroomGame: classroomGame!,
			expiresAt: new Date(Date.now() + 60_000),
		});
		const redemption = entityManager.create(AcquisitionCodeRedemption, {
			acquisitionCode: code,
			redeemedBy: user!,
		});

		try {
			entityManager.persist([code, redemption]);
			await entityManager.flush();
			const response = await agent
				.get('/api/v1/admin/billing/acquisition-codes')
				.query({ limit: 10, offset: 0, q: rawCode })
				.expect(200);

			expect(response.body.acquisitionCodeList).toEqual([
				expect.objectContaining({
					code: `******-******-**${getAcquisitionCodeSuffix(rawCode)}`,
					gameTitle: expect.any(String),
					classroomName: expect.any(String),
					institutionName: expect.any(String),
					redemptionList: [expect.objectContaining({ userEmail: user!.email })],
				}),
			]);
			expect(JSON.stringify(response.body)).not.toContain(rawCode);
		} finally {
			if (code.id) {
				await entityManager.nativeDelete(AcquisitionCodeRedemption, { acquisitionCode: code.id });
				await entityManager.nativeDelete(AcquisitionCode, { id: code.id });
			}
		}
	});

	it('searches admin users by name', async () => {
		const agent = request.agent(app.getHttpServer());
		await agent
			.post('/api/v1/auth/login')
			.send({ email: 'user1@scholark.com', password: 'password' })
			.expect(200);

		const response = await agent
			.get('/api/v1/admin/users')
			.query({ q: 'Avery' })
			.expect(200);

		expect(response.body.userList).toEqual(
			expect.arrayContaining([expect.objectContaining({ firstName: 'Avery' })]),
		);
	});

	it('creates, updates, deactivates, and reactivates an institution', async () => {
		const agent = request.agent(app.getHttpServer());
		await agent
			.post('/api/v1/auth/login')
			.send({ email: 'user1@scholark.com', password: 'password' })
			.expect(200);

		const slug = `e2e-institution-${Date.now()}`;
		let institutionId: string | undefined;
		try {
			const createResponse = await agent
				.post('/api/v1/admin/institutions')
				.send({ name: 'E2E Institution', slug, summary: 'Test record' })
				.expect(201);
			institutionId = createResponse.body.institution.id;
			expect(createResponse.body.institution.status).toBe('active');

			await agent
				.post('/api/v1/admin/institutions')
				.send({ name: 'Duplicate Institution', slug })
				.expect(409);

			const entityManager = app.get(MikroORM).em.fork();
			await entityManager.getConnection().execute(
				"INSERT INTO course (institution_id, name, code, slug, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'active', now(), now())",
				[institutionId, 'E2E Course', 'E2E', `${slug}-course`],
			);

			await agent
				.patch(`/api/v1/admin/institutions/${institutionId}`)
				.send({ status: 'inactive' })
				.expect(409);
			await entityManager.getConnection().execute('DELETE FROM course WHERE institution_id = ?', [institutionId]);

			const updateResponse = await agent
				.patch(`/api/v1/admin/institutions/${institutionId}`)
				.send({ name: 'Updated E2E Institution', websiteUrl: 'https://example.edu' })
				.expect(200);
			expect(updateResponse.body.institution.name).toBe('Updated E2E Institution');

			const deactivateResponse = await agent
				.patch(`/api/v1/admin/institutions/${institutionId}`)
				.send({ status: 'inactive' })
				.expect(200);
			expect(deactivateResponse.body.institution.status).toBe('inactive');

			const reactivateResponse = await agent
				.patch(`/api/v1/admin/institutions/${institutionId}`)
				.send({ status: 'active' })
				.expect(200);
			expect(reactivateResponse.body.institution.status).toBe('active');
		} finally {
			if (institutionId) {
				await app.get(MikroORM).em.getConnection().execute('DELETE FROM course WHERE institution_id = ?', [institutionId]);
				await app.get(MikroORM).em.nativeDelete(Institution, { id: institutionId });
			}
		}
	});

	it('creates and updates courses while enforcing institution status', async () => {
		const agent = request.agent(app.getHttpServer());
		await agent
			.post('/api/v1/auth/login')
			.send({ email: 'user1@scholark.com', password: 'password' })
			.expect(200);

		const suffix = Date.now();
		const institutionSlug = `e2e-course-institution-${suffix}`;
		const courseSlug = `e2e-course-${suffix}`;
		let institutionId: string | undefined;
		try {
			const institutionResponse = await agent
				.post('/api/v1/admin/institutions')
				.send({ name: 'E2E Course Institution', slug: institutionSlug })
				.expect(201);
			institutionId = institutionResponse.body.institution.id;

			const createResponse = await agent
				.post('/api/v1/admin/courses')
				.send({ code: 'E2E-COURSE', institutionId, name: 'E2E Course', slug: courseSlug })
				.expect(201);
			const courseId = createResponse.body.course.id;
			expect(createResponse.body.course.status).toBe('active');

			await agent
				.post('/api/v1/admin/courses')
				.send({ code: 'E2E-OTHER', institutionId, name: 'Duplicate Course', slug: courseSlug })
				.expect(409);

			const updateResponse = await agent
				.patch(`/api/v1/admin/courses/${courseId}`)
				.send({ name: 'Updated E2E Course', summary: 'Updated through admin' })
				.expect(200);
			expect(updateResponse.body.course.name).toBe('Updated E2E Course');

			await agent
				.patch(`/api/v1/admin/courses/${courseId}`)
				.send({ status: 'inactive' })
				.expect(200);
			await agent
				.patch(`/api/v1/admin/institutions/${institutionId}`)
				.send({ status: 'inactive' })
				.expect(200);
			await agent
				.patch(`/api/v1/admin/courses/${courseId}`)
				.send({ status: 'active' })
				.expect(409);

			await agent
				.patch(`/api/v1/admin/institutions/${institutionId}`)
				.send({ status: 'active' })
				.expect(200);
			await agent
				.patch(`/api/v1/admin/courses/${courseId}`)
				.send({ status: 'active' })
				.expect(200);
		} finally {
			if (institutionId) {
				await app.get(MikroORM).em.getConnection().execute('DELETE FROM course WHERE institution_id = ?', [institutionId]);
				await app.get(MikroORM).em.getConnection().execute('DELETE FROM institution WHERE id = ?', [institutionId]);
			}
		}
	});

	it('creates and updates classrooms with course associations and status guards', async () => {
		const agent = request.agent(app.getHttpServer());
		await agent
			.post('/api/v1/auth/login')
			.send({ email: 'user1@scholark.com', password: 'password' })
			.expect(200);

		const suffix = Date.now();
		const institutionSlug = `e2e-classroom-institution-${suffix}`;
		const courseSlug = `e2e-classroom-course-${suffix}`;
		const classroomSlug = `e2e-classroom-${suffix}`;
		let institutionId: string | undefined;
		try {
			const institutionResponse = await agent
				.post('/api/v1/admin/institutions')
				.send({ name: 'E2E Classroom Institution', slug: institutionSlug })
				.expect(201);
			institutionId = institutionResponse.body.institution.id;

			const courseResponse = await agent
				.post('/api/v1/admin/courses')
				.send({ code: 'E2E-CLASS-COURSE', institutionId, name: 'E2E Classroom Course', slug: courseSlug })
				.expect(201);
			const courseId = courseResponse.body.course.id;

			const createResponse = await agent
				.post('/api/v1/admin/classrooms')
				.send({ code: 'E2E-CLASSROOM', courseIdList: [courseId], institutionId, name: 'E2E Classroom', slug: classroomSlug })
				.expect(201);
			const classroomId = createResponse.body.classroom.id;
			expect(createResponse.body.classroom.courseList).toEqual(
				expect.arrayContaining([expect.objectContaining({ id: courseId })]),
			);

			await agent
				.post('/api/v1/admin/classrooms')
				.send({ code: 'E2E-OTHER-CLASS', institutionId, name: 'Duplicate Classroom', slug: classroomSlug })
				.expect(409);

			const updateResponse = await agent
				.patch(`/api/v1/admin/classrooms/${classroomId}`)
				.send({ courseIdList: [courseId], instructorIdList: [], name: 'Updated E2E Classroom', taxonomyTermIdList: [] })
				.expect(200);
			expect(updateResponse.body.classroom.name).toBe('Updated E2E Classroom');
			expect(updateResponse.body.classroom.courseList).toEqual(
				expect.arrayContaining([expect.objectContaining({ id: courseId })]),
			);

			await agent
				.patch(`/api/v1/admin/institutions/${institutionId}`)
				.send({ status: 'inactive' })
				.expect(409);
			await agent
				.patch(`/api/v1/admin/classrooms/${classroomId}`)
				.send({ status: 'inactive' })
				.expect(200);
			await agent
				.patch(`/api/v1/admin/courses/${courseId}`)
				.send({ status: 'inactive' })
				.expect(200);
			await agent
				.patch(`/api/v1/admin/institutions/${institutionId}`)
				.send({ status: 'inactive' })
				.expect(200);
			await agent
				.patch(`/api/v1/admin/classrooms/${classroomId}`)
				.send({ status: 'active' })
				.expect(409);

			await agent
				.patch(`/api/v1/admin/institutions/${institutionId}`)
				.send({ status: 'active' })
				.expect(200);
			await agent
				.patch(`/api/v1/admin/courses/${courseId}`)
				.send({ status: 'active' })
				.expect(200);
			await agent
				.patch(`/api/v1/admin/classrooms/${classroomId}`)
				.send({ status: 'active' })
				.expect(200);
		} finally {
			if (institutionId) {
				await app.get(MikroORM).em.getConnection().execute('DELETE FROM classroom WHERE institution_id = ?', [institutionId]);
				await app.get(MikroORM).em.getConnection().execute('DELETE FROM course WHERE institution_id = ?', [institutionId]);
				await app.get(MikroORM).em.getConnection().execute('DELETE FROM institution WHERE id = ?', [institutionId]);
			}
		}
	});

	it('searches taxonomy terms by label or slug', async () => {
		const agent = request.agent(app.getHttpServer());
		await agent
			.post('/api/v1/auth/login')
			.send({ email: 'user1@scholark.com', password: 'password' })
			.expect(200);

		const response = await agent
			.get('/api/v1/admin/taxonomy')
			.query({ q: 'humanities' })
			.expect(200);

		expect(response.body.taxonomyTermList).toEqual(
			expect.arrayContaining([expect.objectContaining({ slug: 'humanities' })]),
		);
	});

	it('creates and updates taxonomy terms with type-scoped slug uniqueness', async () => {
		const agent = request.agent(app.getHttpServer());
		await agent
			.post('/api/v1/auth/login')
			.send({ email: 'user1@scholark.com', password: 'password' })
			.expect(200);

		const suffix = Date.now();
		const slug = `e2e-taxonomy-${suffix}`;
		let taxonomyTermId: string | undefined;
		try {
			const createResponse = await agent
				.post('/api/v1/admin/taxonomy')
				.send({ label: 'E2E taxonomy term', slug, type: 'theme' })
				.expect(201);
			taxonomyTermId = createResponse.body.taxonomyTerm.id;
			expect(createResponse.body.taxonomyTerm).toMatchObject({ label: 'E2E taxonomy term', slug, type: 'theme' });

			await agent
				.post('/api/v1/admin/taxonomy')
				.send({ label: 'Duplicate taxonomy term', slug, type: 'theme' })
				.expect(409);

			const updateResponse = await agent
				.patch(`/api/v1/admin/taxonomy/${taxonomyTermId}`)
				.send({ label: 'Updated E2E taxonomy term', slug: `${slug}-updated` })
				.expect(200);
			expect(updateResponse.body.taxonomyTerm).toMatchObject({ label: 'Updated E2E taxonomy term', slug: `${slug}-updated`, type: 'theme' });
		} finally {
			if (taxonomyTermId) {
				await app.get(MikroORM).em.getConnection().execute('DELETE FROM taxonomy_term WHERE id = ?', [taxonomyTermId]);
			}
		}
	});

	it('creates and updates publishers with unique slugs and optional websites', async () => {
		const agent = request.agent(app.getHttpServer());
		await agent
			.post('/api/v1/auth/login')
			.send({ email: 'user1@scholark.com', password: 'password' })
			.expect(200);

		const suffix = Date.now();
		const slug = `e2e-publisher-${suffix}`;
		let publisherId: string | undefined;
		try {
			const createResponse = await agent
				.post('/api/v1/admin/publishers')
				.send({ name: 'E2E Publisher', slug, websiteUrl: 'https://example.com' })
				.expect(201);
			publisherId = createResponse.body.publisher.id;
			expect(createResponse.body.publisher).toMatchObject({ name: 'E2E Publisher', slug, websiteUrl: 'https://example.com' });
			expect(createResponse.body.publisher.gameList).toHaveLength(0);

			await agent
				.post('/api/v1/admin/publishers')
				.send({ name: 'Duplicate Publisher', slug })
				.expect(409);

			const updateResponse = await agent
				.patch(`/api/v1/admin/publishers/${publisherId}`)
				.send({ name: 'Updated E2E Publisher', slug: `${slug}-updated`, websiteUrl: '' })
				.expect(200);
			expect(updateResponse.body.publisher).toMatchObject({ name: 'Updated E2E Publisher', slug: `${slug}-updated` });
			expect(updateResponse.body.publisher.websiteUrl).toBeUndefined();
		} finally {
			if (publisherId) {
				await app.get(MikroORM).em.getConnection().execute('DELETE FROM publisher WHERE id = ?', [publisherId]);
			}
		}
	});

	it('creates and updates games with required publisher ownership', async () => {
		const agent = request.agent(app.getHttpServer());
		await agent
			.post('/api/v1/auth/login')
			.send({ email: 'user1@scholark.com', password: 'password' })
			.expect(200);

		const suffix = Date.now();
		const publisherSlug = `e2e-game-publisher-${suffix}`;
		const gameSlug = `e2e-game-${suffix}`;
		const institutionSlug = `e2e-assignment-institution-${suffix}`;
		const classroomSlug = `e2e-assignment-classroom-${suffix}`;
		let publisherId: string | undefined;
		let gameId: string | undefined;
		let gameVariantId: string | undefined;
		let institutionId: string | undefined;
		let classroomId: string | undefined;
		let classroomGameId: string | undefined;
		let replacementClassroomGameId: string | undefined;
		try {
			const publisherResponse = await agent
				.post('/api/v1/admin/publishers')
				.send({ name: 'E2E Game Publisher', slug: publisherSlug })
				.expect(201);
			publisherId = publisherResponse.body.publisher.id;

			const institutionResponse = await agent
				.post('/api/v1/admin/institutions')
				.send({ name: 'E2E Assignment Institution', slug: institutionSlug })
				.expect(201);
			institutionId = institutionResponse.body.institution.id;
			const classroomResponse = await agent
				.post('/api/v1/admin/classrooms')
				.send({ code: 'E2E-ASSIGNMENT', institutionId, name: 'E2E Assignment Classroom', slug: classroomSlug })
				.expect(201);
			classroomId = classroomResponse.body.classroom.id;

			const createResponse = await agent
				.post('/api/v1/admin/games')
				.send({ description: 'Game description', featured: true, publisherId, slug: gameSlug, summary: 'Game summary', title: 'E2E Game' })
				.expect(201);
			gameId = createResponse.body.game.id;
			expect(createResponse.body.game).toMatchObject({
				description: 'Game description',
				featured: true,
				publisher: expect.objectContaining({ id: publisherId }),
				slug: gameSlug,
				summary: 'Game summary',
				title: 'E2E Game',
				versionList: [],
			});

			await agent
				.post('/api/v1/admin/games')
				.send({ publisherId, slug: gameSlug, title: 'Duplicate E2E Game' })
				.expect(409);

			const updateResponse = await agent
				.patch(`/api/v1/admin/games/${gameId}`)
				.send({ description: '', featured: false, slug: `${gameSlug}-updated`, title: 'Updated E2E Game' })
				.expect(200);
			expect(updateResponse.body.game).toMatchObject({
				featured: false,
				slug: `${gameSlug}-updated`,
				title: 'Updated E2E Game',
			});
			expect(updateResponse.body.game.description).toBeUndefined();

			const gameVersionInput = {
				description: 'Version description',
				publisherVersion: '1.0.0-e2e',
				runUrl: 'https://example.com/e2e',
				variantList: [{ language: 'en', mode: 'default' }, { language: 'es', mode: 'default' }],
			};
			const gameVersionResponse = await agent
				.post(`/api/v1/admin/games/${gameId}/versions`)
				.send(gameVersionInput)
				.expect(201);
			const gameVersion = gameVersionResponse.body.game.versionList[0];
			const gameVersionId = gameVersion.id as string;
			expect(gameVersion).toMatchObject({ description: 'Version description', publisherVersion: '1.0.0-e2e', runUrl: 'https://example.com/e2e' });
			expect(gameVersion.variantList).toHaveLength(2);
			gameVariantId = gameVersion.variantList[0].id as string;
			await agent
				.patch(`/api/v1/admin/games/${gameId}/versions/${gameVersionId}`)
				.send({ description: 'Updated version description', publishedAt: '2000-01-01T00:00:00.000Z' })
				.expect(200);
			await agent
				.patch(`/api/v1/admin/games/${gameId}/versions/${gameVersionId}`)
				.send({ description: 'Published version edit' })
				.expect(409);
			await agent
				.post(`/api/v1/admin/games/${gameId}/versions`)
				.send(gameVersionInput)
				.expect(409);
			await agent
				.post(`/api/v1/admin/games/${gameId}/versions`)
				.send({ ...gameVersionInput, publisherVersion: 'duplicate-variants', variantList: [{ language: 'en', mode: 'default' }, { language: 'en', mode: 'default' }] })
				.expect(409);
			await agent
				.post(`/api/v1/admin/games/${gameId}/versions`)
				.send({ ...gameVersionInput, publisherVersion: 'missing-variant', variantList: [] })
				.expect(400);

			await agent
				.post(`/api/v1/admin/games/${gameId}/public-offers`)
				.send({ available: true, gameVariantId, price: { currency: 'USD', minorUnitAmount: 1800 } })
				.expect(201);
			const offerListResponse = await agent
				.get('/api/v1/admin/game-offers?type=public&limit=10&offset=0&q=E2E Game')
				.expect(200);
			const publicOfferId = offerListResponse.body.offerList[0].id as string;
			const publicOfferUpdateResponse = await agent
				.patch(`/api/v1/admin/games/${gameId}/public-offers/${publicOfferId}`)
				.send({ available: false, price: { currency: 'USD', minorUnitAmount: 1999 }, publishedAt: null })
				.expect(200);
			const publicOffer = publicOfferUpdateResponse.body.game.versionList[0].variantList[0].publicOfferList[0];
			expect(publicOffer).toMatchObject({ available: false, price: { currency: 'USD', minorUnitAmount: 1999 } });
			expect(publicOffer.publishedAt).toBeUndefined();
			await agent
				.patch(`/api/v1/admin/games/${gameId}/public-offers/${publicOfferId}`)
				.send({ publishedAt: '2000-01-01T00:00:00.000Z' })
				.expect(200);
			await agent
				.patch(`/api/v1/admin/games/${gameId}/public-offers/${publicOfferId}`)
				.send({ available: true })
				.expect(409);

			const institutionOfferInput = {
				designatedPayor: 'student',
				gameVariantId,
				licenseDurationDays: 90,
				price: { currency: 'USD', minorUnitAmount: 1200 },
			};
			const institutionOfferResponse = await agent
				.post(`/api/v1/admin/games/${gameId}/institution-offers`)
				.send(institutionOfferInput)
				.expect(201);
			const institutionOfferId = institutionOfferResponse.body.game.versionList[0].variantList[0].institutionOfferList[0].id as string;
			await agent
				.patch(`/api/v1/admin/games/${gameId}/institution-offers/${institutionOfferId}`)
				.send({ price: { currency: 'USD', minorUnitAmount: 1300 }, publishedAt: '2000-01-01T00:00:00.000Z' })
				.expect(200);
			await agent
				.patch(`/api/v1/admin/games/${gameId}/institution-offers/${institutionOfferId}`)
				.send({ licenseDurationDays: 120 })
				.expect(409);
			await agent
				.post(`/api/v1/admin/games/${gameId}/institution-offers`)
				.send(institutionOfferInput)
				.expect(409);

			const assignmentInput = {
				classroomId,
				endAt: '2027-01-01T00:00:00.000Z',
				institutionGameOfferId: institutionOfferId,
				startAt: '2026-10-01T00:00:00.000Z',
			};
			const assignmentResponse = await agent
				.post('/api/v1/admin/classroom-games')
				.send(assignmentInput)
				.expect(201);
			classroomGameId = assignmentResponse.body.classroomGame.id;
			expect(assignmentResponse.body.classroomGame).toMatchObject({
				classroomId,
				designatedPayor: 'student',
				gameVersionId: expect.any(String),
				institutionGameOfferId: institutionOfferId,
				licenseDurationDays: 90,
				startAt: assignmentInput.startAt,
				endAt: assignmentInput.endAt,
			});
			await agent
				.patch(`/api/v1/admin/classroom-games/${classroomGameId}`)
				.send({ endAt: '2027-02-01T00:00:00.000Z' })
				.expect(200);
			await agent
				.patch(`/api/v1/admin/classroom-games/${classroomGameId}`)
				.send({ publishedAt: '2000-01-01T00:00:00.000Z' })
				.expect(200);
			await agent
				.patch(`/api/v1/admin/classroom-games/${classroomGameId}`)
				.send({ endAt: '2027-03-01T00:00:00.000Z' })
				.expect(409);
			const replacementResponse = await agent
				.post('/api/v1/admin/classroom-games')
				.send({ ...assignmentInput, endAt: '2027-06-01T00:00:00.000Z', publishedAt: '2000-01-01T00:00:00.000Z', startAt: assignmentInput.endAt })
				.expect(201);
			replacementClassroomGameId = replacementResponse.body.classroomGame.id;
			expect(replacementClassroomGameId).not.toBe(classroomGameId);
			await agent
				.post('/api/v1/admin/classroom-games')
				.send({ ...assignmentInput, endAt: assignmentInput.startAt })
				.expect(400);
			await agent
				.post(`/api/v1/admin/games/${publisherId}/public-offers`)
				.send({ available: true, gameVariantId, price: { currency: 'USD', minorUnitAmount: 500 } })
				.expect(404);
		} finally {
			if (classroomGameId) {
				await app.get(MikroORM).em.getConnection().execute('DELETE FROM classroom_game WHERE id = ?', [classroomGameId]);
			}
			if (replacementClassroomGameId) {
				await app.get(MikroORM).em.getConnection().execute('DELETE FROM classroom_game WHERE id = ?', [replacementClassroomGameId]);
			}
			if (gameVariantId) {
				await app.get(MikroORM).em.getConnection().execute('DELETE FROM public_game_offer WHERE game_variant_id = ?', [gameVariantId]);
				await app.get(MikroORM).em.getConnection().execute('DELETE FROM institution_game_offer WHERE game_variant_id = ?', [gameVariantId]);
			}
			if (gameId) {
				await app.get(MikroORM).em.getConnection().execute('DELETE FROM game WHERE id = ?', [gameId]);
			}
			if (publisherId) {
				await app.get(MikroORM).em.getConnection().execute('DELETE FROM publisher WHERE id = ?', [publisherId]);
			}
			if (classroomId) {
				await app.get(MikroORM).em.getConnection().execute('DELETE FROM classroom WHERE id = ?', [classroomId]);
			}
			if (institutionId) {
				await app.get(MikroORM).em.getConnection().execute('DELETE FROM institution WHERE id = ?', [institutionId]);
			}
		}
	});

	it('creates and updates instructors with institution and classroom memberships', async () => {
		const agent = request.agent(app.getHttpServer());
		await agent
			.post('/api/v1/auth/login')
			.send({ email: 'user1@scholark.com', password: 'password' })
			.expect(200);

		const suffix = Date.now();
		const institutionSlug = `e2e-instructor-institution-${suffix}`;
		const classroomSlug = `e2e-instructor-classroom-${suffix}`;
		const instructorSlug = `e2e-instructor-${suffix}`;
		let institutionId: string | undefined;
		let classroomId: string | undefined;
		let instructorId: string | undefined;
		try {
			const institutionResponse = await agent
				.post('/api/v1/admin/institutions')
				.send({ name: 'E2E Instructor Institution', slug: institutionSlug })
				.expect(201);
			institutionId = institutionResponse.body.institution.id;

			const classroomResponse = await agent
				.post('/api/v1/admin/classrooms')
				.send({ code: 'E2E-INSTRUCTOR', institutionId, name: 'E2E Instructor Classroom', slug: classroomSlug })
				.expect(201);
			classroomId = classroomResponse.body.classroom.id;

			const createResponse = await agent
				.post('/api/v1/admin/instructors')
				.send({
					classroomIdList: [classroomId],
					institutionIdList: [institutionId],
					name: 'E2E Instructor',
					slug: instructorSlug,
				})
				.expect(201);
			instructorId = createResponse.body.instructor.id;
			expect(createResponse.body.instructor.institutionList).toEqual(
				expect.arrayContaining([expect.objectContaining({ id: institutionId })]),
			);
			expect(createResponse.body.instructor.classroomList).toEqual(
				expect.arrayContaining([expect.objectContaining({ id: classroomId })]),
			);

			await agent
				.post('/api/v1/admin/instructors')
				.send({ name: 'Duplicate Instructor', slug: instructorSlug })
				.expect(409);

			const updateResponse = await agent
				.patch(`/api/v1/admin/instructors/${instructorId}`)
				.send({ classroomIdList: [], institutionIdList: [], name: 'Updated E2E Instructor' })
				.expect(200);
			expect(updateResponse.body.instructor.name).toBe('Updated E2E Instructor');
			expect(updateResponse.body.instructor.institutionList).toHaveLength(0);
			expect(updateResponse.body.instructor.classroomList).toHaveLength(0);
		} finally {
			if (classroomId) {
				await app.get(MikroORM).em.getConnection().execute('DELETE FROM classroom WHERE id = ?', [classroomId]);
			}
			if (institutionId) {
				await app.get(MikroORM).em.getConnection().execute('DELETE FROM institution WHERE id = ?', [institutionId]);
			}
			if (instructorId) {
				await app.get(MikroORM).em.getConnection().execute('DELETE FROM instructor WHERE id = ?', [instructorId]);
			}
		}
	});

	it('lists institution game offers for administration', async () => {
		const agent = request.agent(app.getHttpServer());
		await agent
			.post('/api/v1/auth/login')
			.send({ email: 'user1@scholark.com', password: 'password' })
			.expect(200);

		const response = await agent
			.get('/api/v1/admin/game-offers')
			.query({ type: 'institution' })
			.expect(200);

		expect(response.body).toHaveProperty('offerList');
	});

	it('revokes persisted Passport sessions by user', async () => {
		const agent = request.agent(app.getHttpServer());
		const loginResponse = await agent
			.post('/api/v1/auth/login')
			.send({ email: 'user1@scholark.com', password: 'password' })
			.expect(200);

		await agent.get('/api/v1/user/me').expect(200);
		await app.get(RedisExpressSessionRevoker).revoke(loginResponse.body.id);
		await agent.get('/api/v1/user/me').expect(401);
	});

	it('rejects acquiring a classroom game already enrolled by the student', async () => {
		const agent = request.agent(app.getHttpServer());
		await agent
			.post('/api/v1/auth/login')
			.send({ email: 'user1@scholark.com', password: 'password' })
			.expect(200);

		await agent
			.post('/api/v1/catalog/classroom-game/00000000-0000-4000-8000-000000000232/acquisition')
			.expect(422);
	});

	it('validates acquisition-code input before database access', async () => {
		const agent = request.agent(app.getHttpServer());
		await agent
			.post('/api/v1/auth/login')
			.send({ email: 'user1@scholark.com', password: 'password' })
			.expect(200);

		await agent
			.post('/api/v1/catalog/classroom-game/00000000-0000-4000-8000-000000000800/redeem-code')
			.send({ code: '' })
			.expect(400);
	});

	it('creates, redeems, and reports an acquisition code', async () => {
		const adminAgent = request.agent(app.getHttpServer());
		const studentAgent = request.agent(app.getHttpServer());
		await adminAgent
			.post('/api/v1/auth/login')
			.send({ email: 'user1@scholark.com', password: 'password' })
			.expect(200);
		await studentAgent
			.post('/api/v1/auth/login')
			.send({ email: 'student2@scholark.com', password: 'password' })
			.expect(200);

		const entityManager = app.get(MikroORM).em.fork();
		const seedClassroomGame = await entityManager.findOne(
			ClassroomGame,
			{ id: '00000000-0000-4000-8000-000000000941' },
			{ populate: ['classroom.institution'] },
		);
		expect(seedClassroomGame).toBeDefined();
		const suffix = `${Date.now()}`;
		const classroom = entityManager.create(Classroom, {
			code: `LEDGER-${suffix}`,
			institution: seedClassroomGame!.classroom.institution,
			name: `Ledger test ${suffix}`,
			slug: `ledger-test-${suffix}`,
			status: EducationCatalogStatus.ACTIVE,
		});
		const now = new Date();
		const classroomGame = entityManager.create(ClassroomGame, {
			classroom,
			endAt: new Date(now.getTime() + 86_400_000),
			institutionGameOffer: seedClassroomGame!.institutionGameOffer,
			publishedAt: now,
			startAt: new Date(now.getTime() - 60_000),
		});
		entityManager.persist([classroom, classroomGame]);
		await entityManager.flush();
		const classroomGameId = classroomGame.id!;

		const createResponse = await adminAgent
			.post('/api/v1/admin/acquisition-codes')
			.send({ classroomGameId, expiresAt: new Date(Date.now() + 86_400_000).toISOString(), quantity: 1 })
			.expect(201);
		const rawCode = createResponse.body.codeList[0] as string;
		const codeEntity = await entityManager.findOne(AcquisitionCode, { codeDigest: digestAcquisitionCode(rawCode) });
		expect(rawCode).toEqual(expect.any(String));
		expect(codeEntity?.id).toBeDefined();

		const redemptionResponse = await studentAgent
			.post(`/api/v1/catalog/classroom-game/${classroomGameId}/redeem-code`)
			.send({ code: rawCode })
			.expect(200);
		expect(redemptionResponse.body.licenseDurationDays).toBe(120);
		const acquisition = await entityManager.findOne(GameAcquisition, { license: redemptionResponse.body.licenseId });
		expect(acquisition).toBeDefined();

		const detailResponse = await adminAgent
			.get(`/api/v1/admin/acquisition-codes/${codeEntity!.id}`)
			.expect(200);
		expect(detailResponse.body).toEqual(expect.objectContaining({
			classroomName: classroom.name,
			code: `******-******-**${getAcquisitionCodeSuffix(rawCode)}`,
			institutionName: seedClassroomGame!.classroom.institution.name,
			redemptionList: [expect.objectContaining({ userEmail: 'student2@scholark.com' })],
			eventList: expect.arrayContaining([
				expect.objectContaining({ eventType: 'code_issued', actorType: 'admin' }),
				expect.objectContaining({ eventType: 'code_redeemed', actorType: 'user' }),
			]),
		}));
		expect(JSON.stringify(detailResponse.body)).not.toContain(rawCode);

		const acquisitionDetailResponse = await adminAgent
			.get(`/api/v1/admin/billing/acquisitions/${acquisition!.id}`)
			.expect(200);
		expect(acquisitionDetailResponse.body.codeRedemption).toEqual(expect.objectContaining({
			codeId: codeEntity!.id,
			codeMask: `******-******-**${getAcquisitionCodeSuffix(rawCode)}`,
		}));
		expect(acquisitionDetailResponse.body.eventList).toEqual(
			expect.arrayContaining([expect.objectContaining({ eventType: 'code_redeemed', actorType: 'user' })]),
		);
	});

	afterAll(async () => {
		await app.close();
	});
});
