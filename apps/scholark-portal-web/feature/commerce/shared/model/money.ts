export type Money = {
	minorUnitAmount: number;
	currency: string;
}

export function formatMoney(money: Money): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: money.currency,
		minimumFractionDigits: 0,
	}).format(money.minorUnitAmount / 100);
}