import { registerAs } from '@nestjs/config';
import Joi from 'joi';

export const envSchema = {
	ROUTER_BASE_URL: Joi.string().trim().default('api'),
};

export default registerAs('routing', () => ({
	baseUrl: process.env.ROUTER_BASE_URL ?? 'api',
}));