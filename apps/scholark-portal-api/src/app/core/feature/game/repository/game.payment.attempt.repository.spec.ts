import { GamePaymentAttemptRepository } from './game.payment.attempt.repository';

describe(GamePaymentAttemptRepository.name, () => {
	it('populates the public listing when reloading a locked attempt by id', async () => {
		const attempt = { id: 'attempt-id' };
		const repository = { findOne: jest.fn().mockResolvedValue(attempt) };
		const paymentAttemptRepository = new GamePaymentAttemptRepository(
			repository as never,
			{ getEntityManager: jest.fn().mockReturnValue(undefined) } as never,
		);

		await paymentAttemptRepository.findByIdForUpdate(attempt.id);

		expect(repository.findOne).toHaveBeenNthCalledWith(
			2,
			{ id: attempt.id },
			expect.objectContaining({ populate: expect.arrayContaining(['publicListing']) }),
		);
	});

	it('populates the public listing when reloading a locked attempt by Checkout Session', async () => {
		const attempt = { id: 'attempt-id' };
		const repository = { findOne: jest.fn().mockResolvedValue(attempt) };
		const paymentAttemptRepository = new GamePaymentAttemptRepository(
			repository as never,
			{ getEntityManager: jest.fn().mockReturnValue(undefined) } as never,
		);

		await paymentAttemptRepository.findByCheckoutSessionIdForUpdate('cs_test_123');

		expect(repository.findOne).toHaveBeenNthCalledWith(
			2,
			{ stripeCheckoutSessionId: 'cs_test_123' },
			expect.objectContaining({ populate: expect.arrayContaining(['publicListing']) }),
		);
	});
});