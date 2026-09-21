import { registerAs } from '@nestjs/config';
import Joi from 'joi';

export const envSchema = {
	STRIPE_API_KEY: Joi.string().required(),
	STRIPE_PORTAL_URL: Joi.string().uri().required(),
	STRIPE_WEBHOOK_SECRET: Joi.string().required(),
};

export default registerAs('stripe', () => ({
	apiKey: process.env.STRIPE_API_KEY,
	cancelUrl: process.env.STRIPE_CHECKOUT_CANCEL_URL,
	successUrl: process.env.STRIPE_CHECKOUT_SUCCESS_URL,
	portalUrl: process.env.STRIPE_PORTAL_URL,
	webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
}));