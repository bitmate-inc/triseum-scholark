import { Validator } from '../../../infrastructure/validation/validator/validator';
import { GameLicenseRepository } from '../repository/game.license.repository';
import { CreateGameLaunchTicketCommand, CreateGameLaunchTicketCommandData } from './create.game.launch.ticket.command';

const userId = '00000000-0000-4000-8000-000000000001';
const licenseId = '00000000-0000-4000-8000-000000000002';
const currentTime = new Date('2026-09-27T12:00:00.000Z');

function createCommand(ticketTtlSeconds: number, licenseTtlSeconds: number) {
	const license = {
		endAt: new Date(currentTime.getTime() + licenseTtlSeconds * 1000),
		gameVariant: {
			gameVersion: {
				id: '00000000-0000-4000-8000-000000000003',
				isPublished: () => true,
			},
		},
		id: licenseId,
		isActive: () => true,
	};
	const repository = { findOwnedById: jest.fn().mockResolvedValue(license) };
	const jwtService = { signAsync: jest.fn().mockResolvedValue('signed-launch-ticket') };
	const command = new CreateGameLaunchTicketCommand(
		repository as unknown as GameLicenseRepository,
		jwtService as never,
		new Validator(),
		{ publicOrigin: 'https://games.example.test', ticketTtlSeconds } as never,
	);

	return { command, jwtService, license, repository };
}

describe(CreateGameLaunchTicketCommand.name, () => {
	beforeEach(() => {
		jest.useFakeTimers().setSystemTime(currentTime);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('uses the configured validity when it is shorter than the license term', async () => {
		const { command, jwtService } = createCommand(90, 3600);

		const result = await command.execute(CreateGameLaunchTicketCommandData.create({ licenseId, userId }));

		expect(result.validForSeconds).toBe(90);
		expect(jwtService.signAsync).toHaveBeenCalledWith(
			expect.objectContaining({ purpose: 'game_launch', licenseId, sub: userId }),
			expect.objectContaining({ expiresIn: 90 }),
		);
	});

	it('caps ticket validity at the license expiry', async () => {
		const { command, jwtService } = createCommand(90, 12);

		const result = await command.execute(CreateGameLaunchTicketCommandData.create({ licenseId, userId }));

		expect(result.validForSeconds).toBe(12);
		expect(jwtService.signAsync).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({ expiresIn: 12 }));
	});

	it('does not issue a ticket when the license expires within the next second', async () => {
		const { command, jwtService } = createCommand(90, 0);

		const result = await command.execute(CreateGameLaunchTicketCommandData.create({ licenseId, userId }));

		expect(result.validationResult?.errorMessage).toContain('unavailable for launch');
		expect(jwtService.signAsync).not.toHaveBeenCalled();
	});
});