export const DIACRITIC_CHARACTER_LIST = 'áàâäãåāăąçćčďđéèêëēėęěğíìîïīįłñńňóòôöõøōőřśšşťúùûüūůűýÿžźż';
export const ASCII_CHARACTER_LIST = 'aaaaaaaaacccddeeeeeeeegiiiiiilnnnoooooooorssstuuuuuuuyyzzz';

export function normalizeCatalogSearchQuery(searchQuery: string): string {
	return searchQuery
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLocaleLowerCase();
}
