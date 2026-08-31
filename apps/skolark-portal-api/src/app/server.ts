import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import type { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';

import serverConfig from '../config/server';
import swaggerConfig from '../config/swagger';
import { createClassSerializerInterceptor } from '../lib/interceptor/class-serializer.interceptor.factory';
import { WwwModule } from './www/www.module';
import { createWwwOpenApiDocument } from './www/www.open-api.factory';

export function configureApp(app: NestExpressApplication): void {
	const server = app.get<ConfigType<typeof serverConfig>>(serverConfig.KEY);
	const swagger = app.get<ConfigType<typeof swaggerConfig>>(swaggerConfig.KEY);

	app.enableCors(server.cors as CorsOptions);
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
	const app = await NestFactory.create<NestExpressApplication>(WwwModule);
  
	configureApp(app);

	const server = app.get<ConfigType<typeof serverConfig>>(serverConfig.KEY);
	await app.listen(server.server.port);
}