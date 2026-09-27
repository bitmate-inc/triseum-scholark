import type Stripe from 'stripe';

import { GameAcquisitionEventActorType, GameAcquisitionEventType } from '../model/game.acquisition.event.entity';
import { GamePaymentAttemptStatus } from '../model/game.payment.attempt.entity';
import { StripeWebhookEventStatus } from '../model/stripe.webhook.event.entity';
import { ProcessGamePaymentWebhookCommand } from './process.game.payment.webhook.command';

function createCommand(purchaseType: 'public' | 'classroom') {
	const user = { id: '00000000-0000-4000-8000-000000000001' };
	const publicOffer = purchaseType === 'public' ? { id: '00000000-0000-4000-8000-000000000002' } : undefined;
	const institutionGameOffer = purchaseType === 'classroom' ? { id: '00000000-0000-4000-8000-000000000003' } : undefined;
	const classroomGame = purchaseType === 'classroom' ? { id: '00000000-0000-4000-8000-000000000004' } : undefined;
	const attempt = {
		classroomGame,
		customization: undefined,
		id: '00000000-0000-4000-8000-000000000005',
		institutionGameOffer,
		licenseDurationDays: 90,
		price: { currency: 'USD', minorUnitAmount: 1200 },
		publicOffer,
		status: GamePaymentAttemptStatus.PENDING,
		user,
	};
	const session = {
		client_reference_id: user.id,
		id: 'cs_test_123',
		metadata: {
			attemptId: attempt.id,
			classroomGameId: classroomGame?.id,
			offerId: publicOffer?.id ?? institutionGameOffer?.id,
			purchaseType,
			userId: user.id,
		},
		payment_intent: 'pi_test_456',
		payment_status: 'paid',
	};
	const stripeEvent = {
		data: { object: session },
		id: 'evt_test_789',
		type: 'checkout.session.completed',
	} as unknown as Stripe.Event;
	const webhookEvent = { status: StripeWebhookEventStatus.PENDING };
	const stripe = {
		webhooks: { constructEvent: jest.fn().mockReturnValue(stripeEvent) },
	} as unknown as Stripe;
	const paymentAttemptRepository = {
		findById: jest.fn().mockResolvedValue(attempt),
		save: jest.fn().mockResolvedValue(attempt),
	};
	const acquisitionEventRepository = { save: jest.fn().mockImplementation(async (event) => event) };
	const webhookEventRepository = {
		findByStripeEventId: jest.fn().mockResolvedValueOnce(undefined).mockResolvedValueOnce(webhookEvent),
		save: jest.fn().mockImplementation(async (event) => event),
	};
	const acquired = { id: '00000000-0000-4000-8000-000000000006' };
	const acquirePublicGameOfferCommand = {
		execute: jest.fn().mockResolvedValue({ acquisition: acquired }),
	};
	const acquireClassroomGameCommand = {
		execute: jest.fn().mockResolvedValue({ acquisition: acquired }),
	};
	const unitOfWork = {
		transactional: jest.fn((work: () => Promise<unknown>) => work()),
	};
	const command = new ProcessGamePaymentWebhookCommand(
		stripe,
		{ webhookSecret: 'whsec_test' } as never,
		paymentAttemptRepository as never,
		acquisitionEventRepository as never,
		webhookEventRepository as never,
		acquirePublicGameOfferCommand as never,
		acquireClassroomGameCommand as never,
		unitOfWork as never,
	);

	return {
		acquireClassroomGameCommand,
		acquirePublicGameOfferCommand,
		acquisitionEventRepository,
		attempt,
		command,
		purchaseType,
		stripe,
		stripeEvent,
		webhookEvent,
	};
}

describe(ProcessGamePaymentWebhookCommand.name, () => {
	it.each(['public', 'classroom'] as const)('links the %s purchase and records one fulfillment event', async (purchaseType) => {
		const context = createCommand(purchaseType);

		await context.command.execute(Buffer.from('{}'), 'signature');

		const acquireCommand = purchaseType === 'public'
			? context.acquirePublicGameOfferCommand
			: context.acquireClassroomGameCommand;
		expect(acquireCommand.execute).toHaveBeenCalledWith(expect.objectContaining({ paymentAttempt: context.attempt }));
		expect(context.acquisitionEventRepository.save).toHaveBeenCalledTimes(1);
		expect(context.acquisitionEventRepository.save).toHaveBeenCalledWith(expect.objectContaining({
			acquisition: { id: '00000000-0000-4000-8000-000000000006' },
			actorType: GameAcquisitionEventActorType.STRIPE,
			correlationId: context.stripeEvent.id,
			eventType: GameAcquisitionEventType.PAYMENT_FULFILLED,
			metadata: {
				paymentAttemptId: context.attempt.id,
				stripeCheckoutSessionId: 'cs_test_123',
				stripePaymentIntentId: 'pi_test_456',
			},
			providerReference: 'cs_test_123',
		}));
		expect(context.webhookEvent.status).toBe(StripeWebhookEventStatus.PROCESSED);
	});
});