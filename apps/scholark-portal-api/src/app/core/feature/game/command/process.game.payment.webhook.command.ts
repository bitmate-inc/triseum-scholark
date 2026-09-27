import {
	BadRequestException,
	Inject,
	Injectable,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type Stripe from 'stripe';

import stripeConfig from '../../../../../config/stripe';
import { MikroOrmUnitOfWork } from '../../../../../lib/database/mikro.orm.unit.of.work';
import { StripeClient } from '../../../infrastructure/stripe/stripe.module';
import {
	GameAcquisitionEvent,
	GameAcquisitionEventActorType,
	GameAcquisitionEventType
} from '../model/game.acquisition.event.entity';
import { GamePaymentAttempt, GamePaymentAttemptStatus } from '../model/game.payment.attempt.entity';
import { StripeWebhookEvent, StripeWebhookEventStatus } from '../model/stripe.webhook.event.entity';
import { GameAcquisitionEventRepository } from '../repository/game.acquisition.event.repository';
import { GamePaymentAttemptRepository } from '../repository/game.payment.attempt.repository';
import { StripeWebhookEventRepository } from '../repository/stripe.webhook.event.repository';
import {
	AcquireClassroomGameCommand,
	AcquireClassroomGameCommandData,
	AcquireClassroomGameCommandResult,
} from './acquire.classroom.game.command';
import {
	AcquirePublicOfferCommand,
	AcquirePublicOfferCommandData,
	AcquirePublicOfferCommandResult,
} from './acquire.public.game.offer.command';

@Injectable()
export class ProcessGamePaymentWebhookCommand {

	constructor(
		@Inject(StripeClient()) private readonly stripe: Stripe,
		@Inject(stripeConfig.KEY) private readonly config: ConfigType<typeof stripeConfig>,
		private readonly paymentAttemptRepository: GamePaymentAttemptRepository,
		private readonly acquisitionEventRepository: GameAcquisitionEventRepository,
		private readonly webhookEventRepository: StripeWebhookEventRepository,
		private readonly acquirePublicGameOfferCommand: AcquirePublicOfferCommand,
		private readonly acquireClassroomGameCommand: AcquireClassroomGameCommand,
		private readonly unitOfWork: MikroOrmUnitOfWork,
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

		if (existingEvent?.status === StripeWebhookEventStatus.PROCESSED
			|| existingEvent?.status === StripeWebhookEventStatus.PENDING) {
			return;
		}

		if (existingEvent) {
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
					return;
				}
				
				throw error;
			}
		}

		try {
			await this.unitOfWork.transactional(async () => {
				const attemptId = session.metadata?.attemptId;
				let attempt: GamePaymentAttempt | undefined;

				if (attemptId) {
					attempt = await this.paymentAttemptRepository.findById(attemptId);
				} else {
					attempt = await this.paymentAttemptRepository.findByCheckoutSessionId(session.id);
				}

				if (!attempt) {
					throw new Error('Payment attempt not found');
				}
				if (attempt.stripeCheckoutSessionId && attempt.stripeCheckoutSessionId !== session.id) {
					throw new Error('Stripe Checkout session does not match the payment attempt');
				}

				let purchaseType: 'classroom' | 'public';

				if (attempt.classroomGame) {
					purchaseType = 'classroom';
				} else {
					purchaseType = 'public';
				}

				const metadataMatchesAttempt =
					(!session.client_reference_id || session.client_reference_id === attempt.user.id)
					&& (!session.metadata?.userId || session.metadata.userId === attempt.user.id)
					&& (!session.metadata?.offerId || session.metadata.offerId === (attempt.publicOffer?.id ?? attempt.institutionGameOffer?.id))
					&& (!session.metadata?.classroomGameId || session.metadata.classroomGameId === attempt.classroomGame?.id)
					&& session.metadata?.purchaseType === purchaseType;

				if (!metadataMatchesAttempt) {
					throw new Error('Stripe Checkout metadata does not match the payment attempt');
				}

				if (attempt.status === GamePaymentAttemptStatus.FULFILLED) {
					return;
				}

				let result: AcquireClassroomGameCommandResult | AcquirePublicOfferCommandResult;

				if (attempt.classroomGame) {
					result = await this.acquireClassroomGameCommand.execute(AcquireClassroomGameCommandData.create({
						classroomGameId: attempt.classroomGame.id!,
						customization: attempt.customization,
						licenseDurationDays: attempt.licenseDurationDays,
						paymentAttempt: attempt,
						price: attempt.price,
						userId: attempt.user.id!,
					}));
				} else {
					result = await this.acquirePublicGameOfferCommand.execute(AcquirePublicOfferCommandData.create({
						publicOfferId: attempt.publicOffer!.id!,
						licenseDurationDays: attempt.licenseDurationDays,
						paymentAttempt: attempt,
						price: attempt.price,
						userId: attempt.user.id!,
					}));
				}

				if (result.validationResult) {
					throw new Error(result.validationResult.toString());
				}
				if (!result.acquisition) {
					throw new Error('Acquisition was not created for the payment attempt');
				}

				attempt.status = GamePaymentAttemptStatus.FULFILLED;
				let paymentIntentId: string | undefined;

				if (typeof session.payment_intent === 'string') {
					paymentIntentId = session.payment_intent;
				}

				attempt.stripePaymentIntentId = paymentIntentId;
				attempt.fulfilledAt = new Date();

				await this.paymentAttemptRepository.save(attempt);

				await this.acquisitionEventRepository.save(GameAcquisitionEvent.create({
					acquisition: result.acquisition,
					actorType: GameAcquisitionEventActorType.STRIPE,
					correlationId: event.id,
					eventType: GameAcquisitionEventType.PAYMENT_FULFILLED,
					metadata: {
						paymentAttemptId: attempt.id,
						stripeCheckoutSessionId: session.id,
						stripePaymentIntentId: paymentIntentId,
					},
					providerReference: session.id,
				}));

				const webhookEvent = await this.webhookEventRepository.findByStripeEventId(event.id);

				if (!webhookEvent) {
					throw new Error('Stripe webhook ledger entry not found');
				}

				webhookEvent.status = StripeWebhookEventStatus.PROCESSED;
				webhookEvent.processedAt = new Date();

				await this.webhookEventRepository.save(webhookEvent);
			});
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