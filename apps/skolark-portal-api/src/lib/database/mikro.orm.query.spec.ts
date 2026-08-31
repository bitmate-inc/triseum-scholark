import { addOrderBy, addPagination } from './mikro.orm.query';

function createQueryBuilder() {
	const limitList: number[] = [];
	const offsetList: number[] = [];
	const orderList: Record<string, unknown>[] = [];
	const queryBuilder = {
		limit(limit: number) {
			limitList.push(limit);
			return queryBuilder;
		},
		offset(offset: number) {
			offsetList.push(offset);
			return queryBuilder;
		},
		orderBy(orderBy: Record<string, unknown>) {
			orderList.push(orderBy);
			return queryBuilder;
		},
	};

	return { limitList, offsetList, orderList, queryBuilder };
}

describe('addPagination', () => {
	it('applies the requested limit and offset', () => {
		const { limitList, offsetList, queryBuilder } = createQueryBuilder();

		addPagination(queryBuilder, { limit: 12, offset: 24 });

		expect(limitList).toEqual([12]);
		expect(offsetList).toEqual([24]);
	});

	it('does not apply pagination when none is requested', () => {
		const { limitList, offsetList, queryBuilder } = createQueryBuilder();

		addPagination(queryBuilder);

		expect(limitList).toEqual([]);
		expect(offsetList).toEqual([]);
	});
});

describe('addOrderBy', () => {
	it('copies each requested field and direction to the query builder', () => {
		const { orderList, queryBuilder } = createQueryBuilder();

		addOrderBy(queryBuilder, {
			'game.publishedAt': 'desc',
			'game.title': 'asc',
		});

		expect(orderList).toEqual([
			{ 'game.publishedAt': 'DESC' },
			{ 'game.title': 'ASC' },
		]);
	});

	it('does not apply ordering when none is requested', () => {
		const { orderList, queryBuilder } = createQueryBuilder();

		addOrderBy(queryBuilder);

		expect(orderList).toEqual([]);
	});

	it('supports a default order for callers that define one', () => {
		const { orderList, queryBuilder } = createQueryBuilder();

		addOrderBy(queryBuilder, undefined, 'game.title', 'ASC');

		expect(orderList).toEqual([{ 'game.title': 'ASC' }]);
	});
});