import 'reflect-metadata';

import { GetListQueryData } from '../entity/query/get.list.query';
import {
	GetListFilterByDto,
	IncludeDto,
	OrderByDto,
	PaginationDto,
} from '../entity/query/query.dto';
import {
	createShallowInstance,
	StaticFactory,
	withStaticFactory,
} from './static.factory';

class Example extends StaticFactory {

	name = '';

}

class BaseExample {

	name = '';

}

class MixedExample extends withStaticFactory(BaseExample) {}

describe('StaticFactory', () => {
	it('creates a typed class instance from partial data', () => {
		const example = Example.create({ name: 'ScholArk' });

		expect(example).toBeInstanceOf(Example);
		expect(example.name).toBe('ScholArk');
	});

	it('creates an instance directly from a constructor', () => {
		const example = createShallowInstance(Example, { name: 'Mecenas' });

		expect(example).toBeInstanceOf(Example);
		expect(example.name).toBe('Mecenas');
	});

	it('adds the typed factory to an existing base class', () => {
		const example = MixedExample.create({ name: 'Econland' });

		expect(example).toBeInstanceOf(MixedExample);
		expect(example.name).toBe('Econland');
	});

	it('transforms nested list query data into its DTO classes', () => {
		const query = GetListQueryData.create({
			filterBy: { q: 'history' },
			include: { taxonomyList: true },
			orderBy: { title: 'asc' },
			pagination: { limit: 12, offset: 0 },
		});

		expect(query.filterBy).toBeInstanceOf(GetListFilterByDto);
		expect(query.include).toBeInstanceOf(IncludeDto);
		expect(query.orderBy).toBeInstanceOf(OrderByDto);
		expect(query.pagination).toBeInstanceOf(PaginationDto);
	});
});
