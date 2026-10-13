import { CreateGameCheckoutCommand } from '../../core/feature/game/command/create.game.checkout.command';
import { GameController } from './game.controller';
import { GameAcquisitionRequestDto } from './game.dto';

describe(GameController.name, () => {
	it('forwards the selected language to the checkout command', async () => {
		const createGameCheckoutCommand = {
			createGameCheckout: jest.fn().mockResolvedValue({
				checkoutSessionId: 'checkout-session-id',
				checkoutUrl: 'https://checkout.example.test/session',
			}),
		};
		const controller = new GameController(
			createGameCheckoutCommand as unknown as CreateGameCheckoutCommand,
			{} as never,
			{} as never,
			{} as never,
		);

		await controller.acquireGame(
			{ user: { id: 'user-id' } } as never,
			{ language: 'es', publicListingId: 'listing-id' } as GameAcquisitionRequestDto,
		);

		expect(createGameCheckoutCommand.createGameCheckout).toHaveBeenCalledWith(expect.objectContaining({
			language: 'es',
			publicListingId: 'listing-id',
			userId: 'user-id',
		}));
	});
});