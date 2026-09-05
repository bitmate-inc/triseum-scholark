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
			.send({ email: 'user1@skolark.com', password: 'password' })
			.expect(200);

		await agent.get('/api/v1/user/me').expect(200);
		await app.get(RedisExpressSessionRevoker).revoke(loginResponse.body.id);
		await agent.get('/api/v1/user/me').expect(401);
	});

	afterAll(async () => {
		await app.close();
	});
});
