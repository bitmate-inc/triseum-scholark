import { GamePaymentAttemptStatus } from '../model/game.payment.attempt.entity';
import { ExpireGamePaymentAttemptCommand } from './expire.game.payment.attempt.command';

function createCommand() {
	const attempt = {
		id: '00000000-0000-4000-8000-000000000005',
		status: GamePaymentAttemptStatus.PENDING,
		stripeCheckoutSessionId: 'cs_test_123',
	};
	const paymentAttemptRepository = {
		findByIdForUpdate: jest.fn().mockResolvedValue(attempt),
		findByCheckoutSessionIdForUpdate: jest.fn().mockResolvedValue(attempt),
		save: jest.fn().mockImplementation(async (entity) => entity),
	};
	const unitOfWork = { transactional: jest.fn((work: () => Promise<unknown>) => work()) };
	const command = new ExpireGamePaymentAttemptCommand(paymentAttemptRepository as never, unitOfWork as never);

	return { attempt, command, paymentAttemptRepository };
}

describe(ExpireGamePaymentAttemptCommand.name, () => {
	it('marks a pending attempt failed when its stored Checkout Session expires', async () => {
		const context = createCommand();

		await context.command.execute('cs_test_123', context.attempt.id);

		expect(context.attempt.status).toBe(GamePaymentAttemptStatus.FAILED);
		expect(context.paymentAttemptRepository.save).toHaveBeenCalledWith(context.attempt);
	});

	it('does not change an attempt already fulfilled by another webhook', async () => {
		const context = createCommand();
		context.attempt.status = GamePaymentAttemptStatus.FULFILLED;

		await context.command.execute('cs_test_123', context.attempt.id);

		expect(context.paymentAttemptRepository.save).not.toHaveBeenCalled();
	});

	it('rejects an expired session that does not match the stored attempt', async () => {
		const context = createCommand();

		await expect(context.command.execute('cs_other', context.attempt.id))
			.rejects.toThrow('Stripe Checkout session does not match the payment attempt');
		expect(context.paymentAttemptRepository.save).not.toHaveBeenCalled();
	});
});