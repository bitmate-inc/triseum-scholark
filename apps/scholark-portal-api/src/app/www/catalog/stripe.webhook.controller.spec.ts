import { StripeWebhookController } from './stripe.webhook.controller';

describe(StripeWebhookController.name, () => {
	it('propagates processing failures so Stripe can retry the event', async () => {
		const failure = new Error('database unavailable');
		const processCommand = { execute: jest.fn().mockRejectedValue(failure) };
		const controller = new StripeWebhookController(processCommand as never);

		await expect(controller.processWebhook({ rawBody: Buffer.from('{}') } as never, 'signature'))
			.rejects.toBe(failure);
		expect(processCommand.execute).toHaveBeenCalledWith(Buffer.from('{}'), 'signature');
	});
});