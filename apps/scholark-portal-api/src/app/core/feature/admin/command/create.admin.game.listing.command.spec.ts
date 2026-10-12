import { ConflictException } from '@nestjs/common';

import { Currency } from '../../../shared/commerce/model/currency';
import { CreateAdminGameListingCommand } from './create.admin.game.listing.command';

describe('CreateAdminGameListingCommand', () => {
	it('rejects a second public listing for the same variant', async () => {
		const gameVariantRepository = {
			findOne: jest.fn().mockResolvedValue({ id: 'variant-id' }),
		};
		const publicGameListingRepository = {
			findOne: jest.fn().mockResolvedValue({ id: 'existing-listing-id' }),
		};
		const command = new CreateAdminGameListingCommand(
			gameVariantRepository as never,
			publicGameListingRepository as never,
		);

		await expect(command.createPublic({
			available: true,
			gameId: 'game-id',
			gameVariantId: 'variant-id',
			price: { currency: Currency.USD, minorUnitAmount: 1000 },
		})).rejects.toThrow(ConflictException);
		expect(publicGameListingRepository.findOne).toHaveBeenCalledWith({ gameVariant: 'variant-id' });
	});
});