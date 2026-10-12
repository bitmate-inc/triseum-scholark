import { Injectable } from '@nestjs/common';
import type Stripe from 'stripe';

import { MikroOrmUnitOfWork } from '../../../../../lib/database/mikro.orm.unit.of.work';
import {
	GameAcquisitionEvent,
	GameAcquisitionEventActorType,
	GameAcquisitionEventType,
} from '../model/game.acquisition.event.entity';
import { GamePaymentAttempt, GamePaymentAttemptStatus } from '../model/game.payment.attempt.entity';
import { GameAcquisitionEventRepository } from '../repository/game.acquisition.event.repository';
import { GamePaymentAttemptRepository } from '../repository/game.payment.attempt.repository';
import {
	AcquireClassroomGameListingCommand,
	AcquireClassroomGameListingCommandData,
	AcquireClassroomGameListingCommandResult,
} from './acquire.classroom.game.listing.command';
import {
	AcquirePublicListingCommand,
	AcquirePublicListingCommandData,
	AcquirePublicListingCommandResult,
} from './acquire.public.game.listing.command';

export type GamePaymentFulfillmentSource = 'webhook' | 'revalidation';

@Injectable()
export class FulfillGamePaymentCommand {

	constructor(
		private readonly paymentAttemptRepository: GamePaymentAttemptRepository,
		private readonly acquisitionEventRepository: GameAcquisitionEventRepository,
		private readonly acquirePublicGameListingCommand: AcquirePublicListingCommand,
		private readonly acquireClassroomGameListingCommand: AcquireClassroomGameListingCommand,
		private readonly unitOfWork: MikroOrmUnitOfWork,
	) {}

	async execute(
		session: Stripe.Checkout.Session,
		correlationId: string,
		source: GamePaymentFulfillmentSource,
	): Promise<void> {
		if (session.payment_status !== 'paid' || !session.id) {
			throw new Error('Stripe Checkout session is not paid');
		}

		await this.unitOfWork.transactional(async () => {
			const attemptId = session.metadata?.attemptId;
			let attempt: GamePaymentAttempt | undefined;

			if (attemptId) {
				attempt = await this.paymentAttemptRepository.findByIdForUpdate(attemptId);
			} else {
				attempt = await this.paymentAttemptRepository.findByCheckoutSessionIdForUpdate(session.id);
			}

			if (!attempt) {
				throw new Error('Payment attempt not found');
			}
			if (session.metadata?.attemptId && session.metadata.attemptId !== attempt.id) {
				throw new Error('Stripe Checkout attempt metadata does not match the payment attempt');
			}
			if (attempt.stripeCheckoutSessionId && attempt.stripeCheckoutSessionId !== session.id) {
				throw new Error('Stripe Checkout session does not match the payment attempt');
			}

			const purchaseType = attempt.classroomGameListing ? 'classroom' : 'public';
			const metadataMatchesAttempt =
				(!session.client_reference_id || session.client_reference_id === attempt.user.id)
				&& (!session.metadata?.userId || session.metadata.userId === attempt.user.id)
				&& (!session.metadata?.listingId || session.metadata.listingId === (attempt.publicListing?.id ?? attempt.classroomGameListing?.id))
				&& (!session.metadata?.classroomGameListingId || session.metadata.classroomGameListingId === attempt.classroomGameListing?.id)
				&& session.metadata?.purchaseType === purchaseType;

			if (!metadataMatchesAttempt) {
				throw new Error('Stripe Checkout metadata does not match the payment attempt');
			}
			if (session.amount_total !== attempt.price.minorUnitAmount
				|| session.currency !== attempt.price.currency.toLowerCase()) {
				throw new Error('Stripe Checkout amount does not match the payment attempt');
			}

			if (attempt.status === GamePaymentAttemptStatus.FULFILLED) {
				return;
			}

			let result: AcquireClassroomGameListingCommandResult | AcquirePublicListingCommandResult;

			if (attempt.classroomGameListing) {
				result = await this.acquireClassroomGameListingCommand.execute(AcquireClassroomGameListingCommandData.create({
					classroomGameListingId: attempt.classroomGameListing.id!,
					customization: attempt.customization,
					licenseDurationDays: attempt.licenseDurationDays,
					paymentAttempt: attempt,
					price: attempt.price,
					userId: attempt.user.id!,
				}));
			} else {
				if (!attempt.publicListing) {
					throw new Error('Public game listing not found for payment attempt');
				}
				result = await this.acquirePublicGameListingCommand.execute(AcquirePublicListingCommandData.create({
					publicListingId: attempt.publicListing.id!,
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
			attempt.stripeCheckoutSessionId = session.id;
			const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : undefined;
			attempt.stripePaymentIntentId = paymentIntentId;
			attempt.fulfilledAt = new Date();

			await this.paymentAttemptRepository.save(attempt);
			await this.acquisitionEventRepository.save(GameAcquisitionEvent.create({
				acquisition: result.acquisition,
				actorType: GameAcquisitionEventActorType.STRIPE,
				correlationId,
				eventType: GameAcquisitionEventType.PAYMENT_FULFILLED,
				metadata: {
					paymentAttemptId: attempt.id,
					source,
					stripeCheckoutSessionId: session.id,
					stripePaymentIntentId: paymentIntentId,
				},
				providerReference: session.id,
			}));
		});
	}

}