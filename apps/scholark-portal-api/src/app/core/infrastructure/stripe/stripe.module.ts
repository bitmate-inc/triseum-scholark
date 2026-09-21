import { Global, Module } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import Stripe from 'stripe';

import stripeConfig from '../../../../config/stripe';

export const StripeClient = () => Stripe;

@Global()
@Module({
	providers: [
		{
			provide: StripeClient(),
			inject: [stripeConfig.KEY],
			useFactory: (config: ConfigType<typeof stripeConfig>) => new Stripe(config.apiKey!),
		},
	],
	exports: [StripeClient()],
})
export class StripeModule {}