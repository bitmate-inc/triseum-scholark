import type Stripe from 'stripe';

import { StripeWebhookEventStatus } from '../model/stripe.webhook.event.entity';
import { ProcessGamePaymentWebhookCommand } from './process.game.payment.webhook.command';

function createCommand(purchaseType: 'public' | 'classroom') {
	const user = { id: '00000000-0000-4000-8000-000000000001' };
	const session = {
		client_reference_id: user.id,
		id: 'cs_test_123',
		metadata: {
			attemptId: '00000000-0000-4000-8000-000000000005',
			classroomGameId: purchaseType === 'classroom' ? '00000000-0000-4000-8000-000000000004' : undefined,
			offerId: purchaseType === 'public' ? '00000000-0000-4000-8000-000000000002' : '00000000-0000-4000-8000-000000000003',
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
	const webhookEventRepository = {
		findByStripeEventId: jest.fn().mockResolvedValueOnce(undefined).mockResolvedValueOnce(webhookEvent),
		save: jest.fn().mockImplementation(async (event) => event),
	};
	const fulfillGamePaymentCommand = {
		execute: jest.fn().mockResolvedValue(undefined),
	};
	const command = new ProcessGamePaymentWebhookCommand(
		stripe,
		{ webhookSecret: 'whsec_test' } as never,
		webhookEventRepository as never,
		fulfillGamePaymentCommand as never,
	);

	return {
		command,
		fulfillGamePaymentCommand,
		purchaseType,
		stripe,
		stripeEvent,
		webhookEvent,
		webhookEventRepository,
	};
}

describe(ProcessGamePaymentWebhookCommand.name, () => {
	it.each(['public', 'classroom'] as const)('links the %s purchase and records one fulfillment event', async (purchaseType) => {
		const context = createCommand(purchaseType);

		await context.command.execute(Buffer.from('{}'), 'signature');

		expect(context.fulfillGamePaymentCommand.execute).toHaveBeenCalledWith(
			context.stripeEvent.data.object,
			context.stripeEvent.id,
			'webhook',
		);
		expect(context.webhookEvent.status).toBe(StripeWebhookEventStatus.PROCESSED);
	});
	it('reprocesses a webhook event left pending by an earlier interruption', async () => {
		const context = createCommand('public');
		const pendingEvent = { status: StripeWebhookEventStatus.PENDING };
		const uniqueViolation = Object.assign(new Error('duplicate event'), { code: '23505' });
		context.webhookEventRepository.findByStripeEventId
			.mockReset()
			.mockResolvedValueOnce(pendingEvent)
			.mockResolvedValueOnce(pendingEvent)
			.mockResolvedValueOnce(pendingEvent);
		context.webhookEventRepository.save.mockRejectedValueOnce(uniqueViolation).mockResolvedValue(pendingEvent);

		await context.command.execute(Buffer.from('{}'), 'signature');

		expect(context.fulfillGamePaymentCommand.execute).toHaveBeenCalledTimes(1);
		expect(pendingEvent.status).toBe(StripeWebhookEventStatus.PROCESSED);
	});
});