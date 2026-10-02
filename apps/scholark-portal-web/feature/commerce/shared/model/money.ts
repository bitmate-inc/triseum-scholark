export type Money = {
	minorUnitAmount: number;
	currency: string;
}

export function formatMoney(money: Money, locale: string): string {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: money.currency,
		minimumFractionDigits: 0,
	}).format(money.minorUnitAmount / 100);
}