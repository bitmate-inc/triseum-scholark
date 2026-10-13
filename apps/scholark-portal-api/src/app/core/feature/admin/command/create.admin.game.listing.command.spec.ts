import { ConflictException } from '@nestjs/common';

import { Currency } from '../../../shared/commerce/model/currency';
import { CreateAdminGameListingCommand } from './create.admin.game.listing.command';

describe('CreateAdminGameListingCommand', () => {
	it('rejects overlapping public listing windows for a game version', async () => {
		const gameVersionRepository = { findOneBy: jest.fn().mockResolvedValue({ id: 'version-id' }) };
		const publicGameListingRepository = {
			findByGameVersion: jest.fn().mockResolvedValue([{ endAt: undefined, startAt: new Date('2020-01-01T00:00:00.000Z') }]),
			save: jest.fn(),
		};
		const unitOfWork = { transactional: jest.fn((work: () => Promise<unknown>) => work()) };
		const command = new CreateAdminGameListingCommand(
			gameVersionRepository as never,
			publicGameListingRepository as never,
			{} as never,
			{} as never,
			unitOfWork as never,
		);

		await expect(command.createPublic({
			available: true,
			gameId: 'game-id',
			gameVersionId: 'version-id',
			priceGroupList: [{
				languageList: ['en'],
				price: { currency: Currency.USD, minorUnitAmount: 1000 },
			}],
		})).rejects.toThrow(ConflictException);
		expect(publicGameListingRepository.findByGameVersion).toHaveBeenCalledWith('version-id');
		expect(publicGameListingRepository.save).not.toHaveBeenCalled();
	});
});