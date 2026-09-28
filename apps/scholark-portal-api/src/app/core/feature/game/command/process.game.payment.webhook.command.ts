import {
	BadRequestException,
	Inject,
	Injectable,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type Stripe from 'stripe';

import stripeConfig from '../../../../../config/stripe';
import { StripeClient } from '../../../infrastructure/stripe/stripe.module';
import { StripeWebhookEvent, StripeWebhookEventStatus } from '../model/stripe.webhook.event.entity';
import { StripeWebhookEventRepository } from '../repository/stripe.webhook.event.repository';
import { FulfillGamePaymentCommand } from './fulfill.game.payment.command';

@Injectable()
export class ProcessGamePaymentWebhookCommand {

	constructor(
		@Inject(StripeClient()) private readonly stripe: Stripe,
		@Inject(stripeConfig.KEY) private readonly config: ConfigType<typeof stripeConfig>,
		private readonly webhookEventRepository: StripeWebhookEventRepository,
		private readonly fulfillGamePaymentCommand: FulfillGamePaymentCommand,
	) {}

	async execute(rawBody: Buffer, signature: string): Promise<void> {
		if (!this.config.webhookSecret) {
			throw new BadRequestException('Stripe webhook is not configured');
		}

		let event: Stripe.Event;

		try {
			event = this.stripe.webhooks.constructEvent(rawBody, signature, this.config.webhookSecret);
		} catch {
			throw new BadRequestException('Invalid Stripe webhook signature');
		}

		if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)) {
			return;
		}

		const session = event.data.object as Stripe.Checkout.Session;

		if (session.payment_status !== 'paid' || !session.id) {
			return;
		}

		const existingEvent = await this.webhookEventRepository.findByStripeEventId(event.id);

		if (existingEvent?.status === StripeWebhookEventStatus.PROCESSED) {
			return;
		}

		if (existingEvent?.status === StripeWebhookEventStatus.FAILED) {
			const claimed = await this.webhookEventRepository.claimFailed(event.id);

			if (!claimed) {
				return;
			}
		} else {
			try {
				await this.webhookEventRepository.save(StripeWebhookEvent.create({
					eventType: event.type,
					status: StripeWebhookEventStatus.PENDING,
					stripeEventId: event.id,
				}));
			} catch (error) {
				if (this.isUniqueViolation(error)) {
					const concurrentEvent = await this.webhookEventRepository.findByStripeEventId(event.id);
					if (!concurrentEvent || concurrentEvent.status === StripeWebhookEventStatus.PROCESSED) {
						return;
					}
					if (concurrentEvent.status === StripeWebhookEventStatus.FAILED) {
						const claimed = await this.webhookEventRepository.claimFailed(event.id);
						if (!claimed) {
							return;
						}
					}
				}
				else {
					throw error;
				}
			}
		}

		try {
			await this.fulfillGamePaymentCommand.execute(session, event.id, 'webhook');
			const webhookEvent = await this.webhookEventRepository.findByStripeEventId(event.id);

			if (!webhookEvent) {
				throw new Error('Stripe webhook ledger entry not found');
			}

			webhookEvent.status = StripeWebhookEventStatus.PROCESSED;
			webhookEvent.processedAt = new Date();
			await this.webhookEventRepository.save(webhookEvent);
		} catch (error) {
			const webhookEvent = await this.webhookEventRepository.findByStripeEventId(event.id);

			if (webhookEvent) {
				let failureMessage: string;

				if (error instanceof Error) {
					failureMessage = error.message;
				} else {
					failureMessage = String(error);
				}

				webhookEvent.status = StripeWebhookEventStatus.FAILED;
				webhookEvent.failureMessage = failureMessage;

				await this.webhookEventRepository.save(webhookEvent);
			}
			throw error;
		}
	}

	private isUniqueViolation(error: unknown): boolean {
		const candidate = error as { code?: string; driverError?: { code?: string } };
		return candidate.code === '23505' || candidate.driverError?.code === '23505';
	}

}