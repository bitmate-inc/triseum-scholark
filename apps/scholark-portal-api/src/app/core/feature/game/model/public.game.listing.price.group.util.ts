import { BadRequestException } from '@nestjs/common';

import { Currency } from '../../../shared/commerce/model/currency';

export interface PublicGameListingPriceGroupInput {
	languageList: string[];
	price: { currency: Currency; minorUnitAmount: number };
}

export function normalizePublicGameListingPriceGroupInputList(
	priceGroupList: PublicGameListingPriceGroupInput[],
): PublicGameListingPriceGroupInput[] {
	if (priceGroupList.length === 0) {
		throw new BadRequestException('At least one price group is required.');
	}

	const assignedLanguageSet = new Set<string>();
	return priceGroupList.map((priceGroup) => {
		if (!Number.isInteger(priceGroup.price.minorUnitAmount) || priceGroup.price.minorUnitAmount < 0) {
			throw new BadRequestException('Price amounts must be non-negative integers.');
		}

		if (priceGroup.languageList.length === 0) {
			throw new BadRequestException('Each price group must include at least one language.');
		}

		const languageList = priceGroup.languageList.map(normalizeLanguageTag);
		for (const language of languageList) {
			if (assignedLanguageSet.has(language)) {
				throw new BadRequestException(`Language ${language} appears in more than one price group.`);
			}
			assignedLanguageSet.add(language);
		}

		return { languageList, price: priceGroup.price };
	});
}

export function normalizeLanguageTag(language: string): string {
	try {
		const [normalizedLanguage] = Intl.getCanonicalLocales(language.trim());
		if (normalizedLanguage) {
			return normalizedLanguage;
		}
	} catch {
		throw new BadRequestException(`Language tag ${language} is invalid.`);
	}

	throw new BadRequestException(`Language tag ${language} is invalid.`);
}
