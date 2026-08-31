import { INestApplication } from '@nestjs/common';
import {
	DocumentBuilder,
	OpenAPIObject,
	SwaggerModule
} from '@nestjs/swagger';

import { createOperationIdFactory } from '../../lib/swagger/operation-id.factory';

export function createWwwOpenApiDocument(
	app: INestApplication,
	config: {
		description: string;
		tagList?: string[];
		title: string;
		version: string;
	},
): OpenAPIObject {
	const options = new DocumentBuilder()
		.setTitle(config.title)
		.setDescription(config.description)
		.setVersion(config.version);

	for (const tag of (config.tagList || [])) {
		options.addTag(tag);
	}

	return SwaggerModule.createDocument(app, options.build(), {
		deepScanRoutes: true,
		operationIdFactory: createOperationIdFactory(),
	});
}