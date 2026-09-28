import {
	HttpException,
	HttpStatus,
	Inject,
	Injectable
} from '@nestjs/common';
import type { RedisClientType } from '@redis/client';
import type Stripe from 'stripe';

import { MikroOrmUnitOfWork } from '../../../../../lib/database/mikro.orm.unit.of.work';
import { RedisClient } from '../../../infrastructure/redis/redis.module';
import { StripeClient } from '../../../infrastructure/stripe/stripe.module';
import { GamePaymentAttemptStatus } from '../model/game.payment.attempt.entity';
import { GamePaymentAttemptRepository } from '../repository/game.payment.attempt.repository';
import { FulfillGamePaymentCommand } from './fulfill.game.payment.command';

@Injectable()
export class RevalidateGamePaymentAttemptCommand {

	constructor(
		@Inject(StripeClient()) private readonly stripe: Stripe,
		@Inject(RedisClient()) private readonly redisClient: RedisClientType,
		private readonly paymentAttemptRepository: GamePaymentAttemptRepository,
		private readonly fulfillGamePaymentCommand: FulfillGamePaymentCommand,
		private readonly unitOfWork: MikroOrmUnitOfWork,
	) {}

	async execute(attemptId: string, userId: string): Promise<GamePaymentAttemptStatus | undefined> {
		const attempt = await this.paymentAttemptRepository.findByIdAndUser(attemptId, userId);
		if (!attempt) {
			return undefined;
		}
		if (attempt.status !== GamePaymentAttemptStatus.PENDING || !attempt.stripeCheckoutSessionId) {
			return attempt.status;
		}
		const cooldown = await this.redisClient.set(
			`scholark:billing:payment-revalidation:${attempt.id}`,
			'checking',
			{ condition: 'NX', expiration: { type: 'EX', value: 10 } },
		);
		if (cooldown !== 'OK') {
			throw new HttpException('Please wait before checking this payment again', HttpStatus.TOO_MANY_REQUESTS);
		}

		const checkoutSessionId = attempt.stripeCheckoutSessionId;
		const session = await this.stripe.checkout.sessions.retrieve(checkoutSessionId);
		if (session.id !== checkoutSessionId) {
			throw new Error('Stripe Checkout session does not match the payment attempt');
		}

		if (session.payment_status === 'paid') {
			await this.fulfillGamePaymentCommand.execute(session, `revalidation:${attempt.id}`, 'revalidation');
		} else if (await this.isTerminalFailure(session)) {
			await this.markFailed(attempt.id!, userId, checkoutSessionId);
		}

		return (await this.paymentAttemptRepository.findByIdAndUser(attemptId, userId))?.status;
	}

	private async isTerminalFailure(session: Stripe.Checkout.Session): Promise<boolean> {
		if (session.status === 'expired') {
			return true;
		}
		if (session.status !== 'complete') {
			return false;
		}

		const paymentIntentId = typeof session.payment_intent === 'string'
			? session.payment_intent
			: session.payment_intent?.id;
		if (!paymentIntentId) {
			return false;
		}

		const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
		return paymentIntent.status === 'canceled' || paymentIntent.status === 'requires_payment_method';
	}

	private async markFailed(attemptId: string, userId: string, checkoutSessionId: string): Promise<void> {
		await this.unitOfWork.transactional(async () => {
			const attempt = await this.paymentAttemptRepository.findByIdForUpdate(attemptId);
			if (!attempt || attempt.user.id !== userId || attempt.stripeCheckoutSessionId !== checkoutSessionId) {
				return;
			}
			if (attempt.status === GamePaymentAttemptStatus.PENDING) {
				attempt.status = GamePaymentAttemptStatus.FAILED;
				await this.paymentAttemptRepository.save(attempt);
			}
		});
	}

}