import type Stripe from 'stripe';

import { GamePaymentAttemptStatus } from '../model/game.payment.attempt.entity';
import {
	CreateClassroomGameCheckoutCommandData,
	CreateGameCheckoutCommand,
	CreateGameCheckoutCommandData
} from './create.game.checkout.command';

function createContext(purchaseType: 'public' | 'classroom', sessionOverrides: Partial<Stripe.Checkout.Session> = {}) {
	const user = { id: '00000000-0000-4000-8000-000000000001' };
	const game = {
		id: '00000000-0000-4000-8000-000000000002',
		isPublished: jest.fn().mockReturnValue(true),
		slug: 'test-game',
		title: 'Test Game',
	};
	const gameVersion = { game, isPublished: jest.fn().mockReturnValue(true) };
	const gameVariant = { gameVersion };
	const publicOffer = {
		gameVariant,
		id: '00000000-0000-4000-8000-000000000003',
		price: { currency: 'USD', minorUnitAmount: 1200 },
		publishedAt: new Date(Date.now() - 1000),
	};
	const institutionGameOffer = { ...publicOffer, licenseDurationDays: 180 };
	const classroomGame = {
		customization: undefined,
		id: '00000000-0000-4000-8000-000000000004',
		institutionGameOffer,
		isAvailable: jest.fn().mockReturnValue(true),
	};
	const attempt = {
		classroomGame: purchaseType === 'classroom' ? classroomGame : undefined,
		id: '00000000-0000-4000-8000-000000000005',
		institutionGameOffer: purchaseType === 'classroom' ? institutionGameOffer : undefined,
		price: { currency: 'USD', minorUnitAmount: 1200 },
		publicOffer: purchaseType === 'public' ? publicOffer : undefined,
		status: GamePaymentAttemptStatus.PENDING,
		stripeCheckoutSessionId: 'cs_test_existing',
		user,
	};
	const checkoutSession = {
		amount_total: 1200,
		client_reference_id: user.id,
		currency: 'usd',
		id: 'cs_test_existing',
		metadata: {
			attemptId: attempt.id,
			classroomGameId: purchaseType === 'classroom' ? classroomGame.id : '',
			offerId: publicOffer.id,
			purchaseType,
			userId: user.id,
		},
		payment_intent: 'pi_test_existing',
		payment_status: 'unpaid',
		status: 'open',
		url: 'https://checkout.stripe.test/existing',
		...sessionOverrides,
	} as Stripe.Checkout.Session;
	const paymentAttemptRepository = {
		findPendingByUserAndPublicOffer: jest.fn().mockResolvedValue(purchaseType === 'public' ? attempt : undefined),
		findPendingByUserAndClassroomGame: jest.fn().mockResolvedValue(purchaseType === 'classroom' ? attempt : undefined),
		findById: jest.fn().mockResolvedValue(undefined),
		markPendingAsFailed: jest.fn().mockResolvedValue(true),
		save: jest.fn().mockImplementation(async (entity) => {
			if (!entity.id) entity.id = '00000000-0000-4000-8000-000000000006';
			return entity;
		}),
	};
	const stripe = {
		checkout: {
			sessions: {
				create: jest.fn().mockResolvedValue({ id: 'cs_test_new', url: 'https://checkout.stripe.test/new' }),
				retrieve: jest.fn().mockResolvedValue(checkoutSession),
			},
		},
		paymentIntents: { retrieve: jest.fn().mockResolvedValue({ status: 'processing' }) },
	};
	const fulfillGamePaymentCommand = {
		execute: jest.fn().mockImplementation(async () => {
			attempt.status = GamePaymentAttemptStatus.FULFILLED;
		}),
	};
	const redisClient = {
		eval: jest.fn().mockResolvedValue(1),
		set: jest.fn().mockResolvedValue('OK'),
	};
	const command = new CreateGameCheckoutCommand(
		{ validate: jest.fn().mockResolvedValue(undefined) } as never,
		{ findForAcquisition: jest.fn().mockResolvedValue(publicOffer) } as never,
		{
			findActiveByUserAndGameVariant: jest.fn().mockResolvedValue(undefined),
			findByUserAndClassroomGame: jest.fn().mockResolvedValue(undefined),
		} as never,
		{ findOneBy: jest.fn().mockResolvedValue(user) } as never,
		paymentAttemptRepository as never,
		{ findForAcquisition: jest.fn().mockResolvedValue(classroomGame) } as never,
		{ findStudentPayorOffer: jest.fn().mockResolvedValue(institutionGameOffer) } as never,
		stripe as unknown as Stripe,
		redisClient as never,
		{ portalUrl: 'https://portal.example.test' } as never,
		fulfillGamePaymentCommand as never,
	);

	return {
		attempt,
		classroomGame,
		command,
		fulfillGamePaymentCommand,
		paymentAttemptRepository,
		publicOffer,
		redisClient,
		stripe,
		user,
	};
}

describe(CreateGameCheckoutCommand.name, () => {
	it.each(['public', 'classroom'] as const)('reuses the existing open %s Checkout Session', async (purchaseType) => {
		const context = createContext(purchaseType);
		const result = purchaseType === 'public'
			? await context.command.createGameCheckout(CreateGameCheckoutCommandData.create({ publicOfferId: context.publicOffer.id, userId: context.user.id }))
			: await context.command.createClassroomGameCheckout(CreateClassroomGameCheckoutCommandData.create({ classroomGameId: context.classroomGame.id, userId: context.user.id }));

		expect(result.checkoutSessionId).toBe('cs_test_existing');
		expect(result.checkoutUrl).toBe('https://checkout.stripe.test/existing');
		expect(context.stripe.checkout.sessions.create).not.toHaveBeenCalled();
		expect(context.paymentAttemptRepository.save).not.toHaveBeenCalled();
	});

	it('fulfills an existing pending attempt when its session is already paid', async () => {
		const context = createContext('public', { payment_status: 'paid' });

		const result = await context.command.createGameCheckout(CreateGameCheckoutCommandData.create({
			publicOfferId: context.publicOffer.id,
			userId: context.user.id,
		}));

		expect(context.fulfillGamePaymentCommand.execute).toHaveBeenCalledWith(
			expect.objectContaining({ id: 'cs_test_existing' }),
			`checkout-retry:${context.attempt.id}`,
			'revalidation',
		);
		expect(result.checkoutUrl).toBe('https://portal.example.test/library');
		expect(context.stripe.checkout.sessions.create).not.toHaveBeenCalled();
	});

	it('does not start another session while the existing payment is processing', async () => {
		const context = createContext('public', { status: 'complete' });

		const result = await context.command.createGameCheckout(CreateGameCheckoutCommandData.create({
			publicOfferId: context.publicOffer.id,
			userId: context.user.id,
		}));

		expect(result.validationResult).toBeDefined();
		expect(context.stripe.checkout.sessions.create).not.toHaveBeenCalled();
		expect(context.paymentAttemptRepository.save).not.toHaveBeenCalled();
	});

	it('marks an expired attempt failed before creating a replacement attempt', async () => {
		const context = createContext('public', { status: 'expired' });

		const result = await context.command.createGameCheckout(CreateGameCheckoutCommandData.create({
			publicOfferId: context.publicOffer.id,
			userId: context.user.id,
		}));

		expect(context.paymentAttemptRepository.markPendingAsFailed).toHaveBeenCalledWith(context.attempt.id, 'cs_test_existing');
		expect(context.paymentAttemptRepository.save).toHaveBeenCalledTimes(2);
		expect(context.stripe.checkout.sessions.create).toHaveBeenCalledWith(
			expect.any(Object),
			expect.objectContaining({ idempotencyKey: 'scholark-checkout:00000000-0000-4000-8000-000000000006' }),
		);
		expect(result.checkoutSessionId).toBe('cs_test_new');
	});

	it('does not create a replacement if a concurrent webhook fulfilled the expired attempt', async () => {
		const context = createContext('public', { status: 'expired' });
		context.paymentAttemptRepository.markPendingAsFailed.mockResolvedValue(false);
		context.paymentAttemptRepository.findById.mockResolvedValue({ status: GamePaymentAttemptStatus.FULFILLED });

		const result = await context.command.createGameCheckout(CreateGameCheckoutCommandData.create({
			publicOfferId: context.publicOffer.id,
			userId: context.user.id,
		}));

		expect(result.checkoutUrl).toBe('https://portal.example.test/library');
		expect(context.stripe.checkout.sessions.create).not.toHaveBeenCalled();
		expect(context.paymentAttemptRepository.save).not.toHaveBeenCalled();
	});

	it('serializes simultaneous starts for the same purchase in Redis', async () => {
		const context = createContext('public');
		context.redisClient.set.mockResolvedValue(null);

		await expect(context.command.createGameCheckout(CreateGameCheckoutCommandData.create({
			publicOfferId: context.publicOffer.id,
			userId: context.user.id,
		}))).rejects.toMatchObject({ status: 429 });
		expect(context.paymentAttemptRepository.findPendingByUserAndPublicOffer).not.toHaveBeenCalled();
	});
});