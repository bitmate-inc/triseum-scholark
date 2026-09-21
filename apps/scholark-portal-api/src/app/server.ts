import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import type { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import type { RedisClientType } from '@redis/client';
import { RedisStore } from 'connect-redis';
import session from 'express-session';
import passport from 'passport';

import authConfig from '../config/auth';
import serverConfig from '../config/server';
import swaggerConfig from '../config/swagger';
import { createClassSerializerInterceptor } from '../lib/interceptor/class-serializer.interceptor.factory';
import { REQUEST_AUTH_PROPERTY } from './core/infrastructure/auth/auth.constant';
import { RedisClient } from './core/infrastructure/redis/redis.module';
import { WwwModule } from './www/www.module';
import { createWwwOpenApiDocument } from './www/www.open-api.factory';

export async function configureApp(app: NestExpressApplication): Promise<void> {
	const auth = app.get<ConfigType<typeof authConfig>>(authConfig.KEY);
	const redisClient = app.get<RedisClientType>(RedisClient());
	const server = app.get<ConfigType<typeof serverConfig>>(serverConfig.KEY);
	const swagger = app.get<ConfigType<typeof swaggerConfig>>(swaggerConfig.KEY);

	if (!redisClient.isOpen) {
		await redisClient.connect();
	}

	app.enableCors(server.cors as CorsOptions);
	app.use(session({
		...auth.session,
		store: new RedisStore({
			client: redisClient,
			prefix: auth.session.redisPrefix,
			ttl: auth.session.ttlSeconds,
		}),
	}));
	app.use(passport.initialize({ userProperty: REQUEST_AUTH_PROPERTY }));
	app.use(passport.session());
	app.useBodyParser('json', { limit: '50mb' });
	app.useBodyParser('text', {
		limit: '5mb',
		type: ['application/xml', 'text/xml'],
	});
	app.set(
		'trust proxy',
		server.server.trustProxy,
	);
	app.enableShutdownHooks();
	app.useGlobalInterceptors(createClassSerializerInterceptor(app));
	app.useGlobalPipes(
		new ValidationPipe({
			forbidNonWhitelisted: true,
			transform: true,
			whitelist: true,
		}),
	);

	const document = createWwwOpenApiDocument(app, swagger.document);

	SwaggerModule.setup(swagger.path, app, document, {
		customSiteTitle: swagger.setup.customSiteTitle,
		jsonDocumentUrl: swagger.setup.jsonDocumentUrl,
		swaggerOptions: {
			persistAuthorization: swagger.setup.persistAuthorization,
		},
	});
}

export async function bootstrap(): Promise<void> {
	const app = await NestFactory.create<NestExpressApplication>(WwwModule, {
		rawBody: true,
	});
  
	await configureApp(app);

	const server = app.get<ConfigType<typeof serverConfig>>(serverConfig.KEY);
	await app.listen(server.server.port, '0.0.0.0');

	console.log(`=== LISTENING ON  "0.0.0.0:${server.server.port}" ===`);
}