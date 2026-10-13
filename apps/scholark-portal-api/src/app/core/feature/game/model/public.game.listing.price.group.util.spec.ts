import { BadRequestException } from '@nestjs/common';

import { Currency } from '../../../shared/commerce/model/currency';
import { normalizePublicGameListingPriceGroupInputList } from './public.game.listing.price.group.util';

describe(normalizePublicGameListingPriceGroupInputList.name, () => {
	const price = { currency: Currency.USD, minorUnitAmount: 2000 };

	it('canonicalizes language tags and retains shared prices', () => {
		expect(normalizePublicGameListingPriceGroupInputList([
			{ languageList: ['en', 'es', 'fr'], price },
			{ languageList: ['ja'], price: { ...price, minorUnitAmount: 2400 } },
		])).toEqual([
			{ languageList: ['en', 'es', 'fr'], price },
			{ languageList: ['ja'], price: { ...price, minorUnitAmount: 2400 } },
		]);
	});

	it('rejects empty groups', () => {
		expect(() => normalizePublicGameListingPriceGroupInputList([])).toThrow(BadRequestException);
		expect(() => normalizePublicGameListingPriceGroupInputList([{ languageList: [], price }])).toThrow(BadRequestException);
	});

	it('rejects duplicate languages after canonicalization', () => {
		expect(() => normalizePublicGameListingPriceGroupInputList([
			{ languageList: ['en-us'], price },
			{ languageList: ['en-US'], price },
		])).toThrow(BadRequestException);
	});

	it('rejects invalid tags and negative prices', () => {
		expect(() => normalizePublicGameListingPriceGroupInputList([{ languageList: ['not a tag'], price }])).toThrow(BadRequestException);
		expect(() => normalizePublicGameListingPriceGroupInputList([
			{ languageList: ['en'], price: { ...price, minorUnitAmount: -1 } },
		])).toThrow(BadRequestException);
	});
});