import { registerAs } from '@nestjs/config';
import Joi from 'joi';

export const envSchema = {
	DEBUG_PREFIX: Joi.string().required(),
};

export default registerAs('debug', () => ({
	prefix: process.env.DEBUG_PREFIX!,
}));