import { ConflictException } from '@nestjs/common';

import { Currency } from '../../../shared/commerce/model/currency';
import { CreateAdminGameOfferCommand } from './create.admin.game.offer.command';

describe('CreateAdminGameOfferCommand', () => {
	it('rejects a second public offer for the same variant', async () => {
		const gameVariantRepository = {
			findOne: jest.fn().mockResolvedValue({ id: 'variant-id' }),
		};
		const institutionGameOfferRepository = {};
		const publicGameOfferRepository = {
			findOne: jest.fn().mockResolvedValue({ id: 'existing-offer-id' }),
		};
		const command = new CreateAdminGameOfferCommand(
			gameVariantRepository as never,
			institutionGameOfferRepository as never,
			publicGameOfferRepository as never,
		);

		await expect(command.createPublic({
			available: true,
			gameId: 'game-id',
			gameVariantId: 'variant-id',
			price: { currency: Currency.USD, minorUnitAmount: 1000 },
		})).rejects.toThrow(ConflictException);
		expect(publicGameOfferRepository.findOne).toHaveBeenCalledWith({ gameVariant: 'variant-id' });
	});
});