import { RequestMethod } from '@nestjs/common';
import { HEADERS_METADATA, METHOD_METADATA } from '@nestjs/common/constants';

import { CreateGameLaunchTicketCommand } from '../../core/feature/game/command/create.game.launch.ticket.command';
import { UserController } from './user.controller';

describe(UserController.name, () => {
	it('creates a launch ticket through a non-cacheable POST route', () => {
		const method = Object.getOwnPropertyDescriptor(UserController.prototype, 'launchGame')!.value!;

		expect(Reflect.getMetadata(METHOD_METADATA, method)).toBe(RequestMethod.POST);
		expect(Reflect.getMetadata(HEADERS_METADATA, method)).toContainEqual({ name: 'Cache-Control', value: 'no-store' });
	});

	it('returns the issued ticket validity to the caller', async () => {
		const launchCommand = {
			execute: jest.fn().mockResolvedValue({
				launchTicket: 'signed-launch-ticket',
				launchUrl: 'https://games.example.test/api/v1/game/launch/exchange',
				license: { gameVariant: { gameVersion: { id: 'version-id' } }, id: 'license-id' },
				validForSeconds: 75,
			}),
		};
		const controller = new UserController(
			{} as never,
			{} as never,
			{} as never,
			{} as never,
			{} as never,
			launchCommand as unknown as CreateGameLaunchTicketCommand,
			{} as never,
		);

		await expect(controller.launchGame({ user: { id: 'user-id' } } as never, 'license-id')).resolves.toEqual({
			gameVersionId: 'version-id',
			launchTicket: 'signed-launch-ticket',
			launchUrl: 'https://games.example.test/api/v1/game/launch/exchange',
			licenseId: 'license-id',
			validForSeconds: 75,
		});
	});

	it('lists payment attempts for only the authenticated user', async () => {
		const paymentAttemptRepository = { findAllByUserId: jest.fn().mockResolvedValue([]) };
		const controller = new UserController(
			{} as never,
			{} as never,
			{} as never,
			paymentAttemptRepository as never,
			{} as never,
			{} as never,
			{} as never,
		);

		await expect(controller.getPaymentAttempts({ user: { id: 'user-id' } } as never))
			.resolves.toEqual({ itemList: [] });
		expect(paymentAttemptRepository.findAllByUserId).toHaveBeenCalledWith('user-id');
	});

	it('revalidates using the authenticated user identity', async () => {
		const revalidateCommand = { execute: jest.fn().mockResolvedValue('fulfilled') };
		const controller = new UserController(
			{} as never,
			{} as never,
			{} as never,
			{} as never,
			revalidateCommand as never,
			{} as never,
			{} as never,
		);

		await expect(controller.revalidatePaymentAttempt(
			{ user: { id: 'user-id' } } as never,
			'00000000-0000-4000-8000-000000000005',
		)).resolves.toEqual({ status: 'fulfilled' });
		expect(revalidateCommand.execute).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000005', 'user-id');
	});
});