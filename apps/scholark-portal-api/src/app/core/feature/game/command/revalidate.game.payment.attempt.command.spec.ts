import type Stripe from 'stripe';

import { GamePaymentAttemptStatus } from '../model/game.payment.attempt.entity';
import { RevalidateGamePaymentAttemptCommand } from './revalidate.game.payment.attempt.command';

function createCommand(sessionOverrides: Partial<Stripe.Checkout.Session> = {}) {
	const attempt = {
		id: '00000000-0000-4000-8000-000000000005',
		status: GamePaymentAttemptStatus.PENDING,
		stripeCheckoutSessionId: 'cs_test_123',
		user: { id: '00000000-0000-4000-8000-000000000001' },
	};
	const session = {
		id: 'cs_test_123',
		payment_intent: 'pi_test_456',
		payment_status: 'unpaid',
		status: 'open',
		...sessionOverrides,
	} as Stripe.Checkout.Session;
	const stripe = {
		checkout: { sessions: { retrieve: jest.fn().mockResolvedValue(session) } },
		paymentIntents: { retrieve: jest.fn().mockResolvedValue({ status: 'processing' }) },
	};
	const redisClient = { set: jest.fn().mockResolvedValue('OK') };
	const paymentAttemptRepository = {
		findByIdAndUser: jest.fn().mockResolvedValue(attempt),
		findByIdForUpdate: jest.fn().mockResolvedValue(attempt),
		save: jest.fn().mockImplementation(async (value) => value),
	};
	const fulfillGamePaymentCommand = {
		execute: jest.fn().mockImplementation(async () => {
			attempt.status = GamePaymentAttemptStatus.FULFILLED;
		}),
	};
	const unitOfWork = { transactional: jest.fn((work: () => Promise<unknown>) => work()) };
	const command = new RevalidateGamePaymentAttemptCommand(
		stripe as unknown as Stripe,
		redisClient as never,
		paymentAttemptRepository as never,
		fulfillGamePaymentCommand as never,
		unitOfWork as never,
	);

	return { attempt, command, fulfillGamePaymentCommand, paymentAttemptRepository, redisClient, stripe, unitOfWork };
}

describe(RevalidateGamePaymentAttemptCommand.name, () => {
	it('retrieves the stored session and fulfills it when Stripe confirms payment', async () => {
		const context = createCommand({ payment_status: 'paid', status: 'complete' });

		await expect(context.command.execute(context.attempt.id, context.attempt.user.id))
			.resolves.toBe(GamePaymentAttemptStatus.FULFILLED);
		expect(context.stripe.checkout.sessions.retrieve).toHaveBeenCalledWith('cs_test_123');
		expect(context.redisClient.set).toHaveBeenCalledWith(
			`scholark:billing:payment-revalidation:${context.attempt.id}`,
			'checking',
			{ condition: 'NX', expiration: { type: 'EX', value: 10 } },
		);
		expect(context.fulfillGamePaymentCommand.execute).toHaveBeenCalledWith(
			expect.objectContaining({ id: 'cs_test_123' }),
			`revalidation:${context.attempt.id}`,
			'revalidation',
		);
	});

	it('rejects repeated checks during the shared cooldown', async () => {
		const context = createCommand();
		context.redisClient.set.mockResolvedValue(null);

		await expect(context.command.execute(context.attempt.id, context.attempt.user.id))
			.rejects.toThrow('Please wait before checking this payment again');
		expect(context.stripe.checkout.sessions.retrieve).not.toHaveBeenCalled();
	});

	it('leaves an open unpaid session pending', async () => {
		const context = createCommand();

		await expect(context.command.execute(context.attempt.id, context.attempt.user.id))
			.resolves.toBe(GamePaymentAttemptStatus.PENDING);
		expect(context.fulfillGamePaymentCommand.execute).not.toHaveBeenCalled();
		expect(context.paymentAttemptRepository.save).not.toHaveBeenCalled();
	});

	it('marks an expired session failed', async () => {
		const context = createCommand({ status: 'expired' });

		await expect(context.command.execute(context.attempt.id, context.attempt.user.id))
			.resolves.toBe(GamePaymentAttemptStatus.FAILED);
		expect(context.paymentAttemptRepository.save).toHaveBeenCalledWith(context.attempt);
	});

	it('marks a complete session failed when its PaymentIntent is terminal', async () => {
		const context = createCommand({ status: 'complete' });
		(context.stripe.paymentIntents.retrieve as jest.Mock).mockResolvedValue({ status: 'requires_payment_method' });

		await expect(context.command.execute(context.attempt.id, context.attempt.user.id))
			.resolves.toBe(GamePaymentAttemptStatus.FAILED);
		expect(context.stripe.paymentIntents.retrieve).toHaveBeenCalledWith('pi_test_456');
	});

	it('does not disclose attempts that do not belong to the user', async () => {
		const context = createCommand();
		context.paymentAttemptRepository.findByIdAndUser.mockResolvedValue(undefined);

		await expect(context.command.execute(context.attempt.id, 'another-user')).resolves.toBeUndefined();
		expect(context.stripe.checkout.sessions.retrieve).not.toHaveBeenCalled();
	});
});