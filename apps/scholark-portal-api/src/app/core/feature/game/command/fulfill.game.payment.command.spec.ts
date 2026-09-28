import type Stripe from 'stripe';

import { GamePaymentAttemptStatus } from '../model/game.payment.attempt.entity';
import { FulfillGamePaymentCommand } from './fulfill.game.payment.command';

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
		stripeCheckoutSessionId: undefined as string | undefined,
		status: GamePaymentAttemptStatus.PENDING,
		user,
	};
	const session = {
		amount_total: 1200,
		client_reference_id: user.id,
		currency: 'usd',
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
	} as unknown as Stripe.Checkout.Session;
	const paymentAttemptRepository = {
		findByIdForUpdate: jest.fn().mockResolvedValue(attempt),
		findByCheckoutSessionIdForUpdate: jest.fn().mockResolvedValue(attempt),
		save: jest.fn().mockImplementation(async (value) => value),
	};
	const acquisitionEventRepository = { save: jest.fn().mockImplementation(async (event) => event) };
	const acquirePublicGameOfferCommand = { execute: jest.fn().mockResolvedValue({ acquisition: { id: 'acquisition-id' } }) };
	const acquireClassroomGameCommand = { execute: jest.fn().mockResolvedValue({ acquisition: { id: 'acquisition-id' } }) };
	const unitOfWork = { transactional: jest.fn((work: () => Promise<unknown>) => work()) };
	const command = new FulfillGamePaymentCommand(
		paymentAttemptRepository as never,
		acquisitionEventRepository as never,
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
		paymentAttemptRepository,
		session,
	};
}

describe(FulfillGamePaymentCommand.name, () => {
	it.each(['public', 'classroom'] as const)('fulfills a paid %s attempt once', async (purchaseType) => {
		const context = createCommand(purchaseType);

		await context.command.execute(context.session, 'evt_test_789', 'webhook');

		const acquireCommand = purchaseType === 'public'
			? context.acquirePublicGameOfferCommand
			: context.acquireClassroomGameCommand;
		expect(acquireCommand.execute).toHaveBeenCalledTimes(1);
		expect(context.attempt.status).toBe(GamePaymentAttemptStatus.FULFILLED);
		expect(context.attempt.stripeCheckoutSessionId).toBe('cs_test_123');
		expect(context.acquisitionEventRepository.save).toHaveBeenCalledWith(expect.objectContaining({
			correlationId: 'evt_test_789',
			metadata: expect.objectContaining({ source: 'webhook' }),
			providerReference: 'cs_test_123',
		}));
	});

	it('does not fulfill a session whose amount differs from the stored attempt', async () => {
		const context = createCommand('public');
		const mismatchedSession = { ...context.session, amount_total: 1300 } as Stripe.Checkout.Session;

		await expect(context.command.execute(mismatchedSession, 'evt_test_789', 'webhook'))
			.rejects.toThrow('Stripe Checkout amount does not match the payment attempt');
		expect(context.acquirePublicGameOfferCommand.execute).not.toHaveBeenCalled();
	});

	it('does not create another acquisition for an already fulfilled attempt', async () => {
		const context = createCommand('public');
		context.attempt.status = GamePaymentAttemptStatus.FULFILLED;

		await context.command.execute(context.session, 'evt_test_789', 'revalidation');

		expect(context.acquirePublicGameOfferCommand.execute).not.toHaveBeenCalled();
	});
});