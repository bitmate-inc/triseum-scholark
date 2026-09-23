import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

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

	afterAll(async () => {
		await app.close();
	});
});
