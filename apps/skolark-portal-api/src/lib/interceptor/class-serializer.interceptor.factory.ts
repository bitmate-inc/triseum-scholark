import { ClassSerializerInterceptor, INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export function createClassSerializerInterceptor(
	app: INestApplication,
): ClassSerializerInterceptor {
	return new ClassSerializerInterceptor(app.get(Reflector));
}