import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { configureApp } from '../src/app/server';
import { WwwModule } from './../src/app/www/www.module';

describe('AppController (e2e)', () => {
	let app: NestExpressApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [WwwModule],
		}).compile();

		app = moduleFixture.createNestApplication<NestExpressApplication>();
		configureApp(app);
		await app.init();
	});

	it('/api/v1/health/alive (GET)', () => {
		return request(app.getHttpServer())
			.get('/api/v1/health/alive')
			.expect(200)
			.expect('');
	});

	afterEach(async () => {
		await app.close();
	});
});
