import type { Request } from 'express';

import { UserIdentityInputFactory } from './user.identity-input.factory';

describe(UserIdentityInputFactory.name, () => {
	const factory = new UserIdentityInputFactory();

	it('extracts and normalizes local credentials from the request', () => {
		const request = {
			body: {
				email: '  User@Example.COM ',
				password: 'Password123',
			},
		} as Request;

		expect(factory.create(request)).toEqual({
			email: 'user@example.com',
			password: 'Password123',
		});
	});

	it('returns empty credentials for invalid request fields', () => {
		const request = {
			body: {
				email: 42,
				password: null,
			},
		} as Request;

		expect(factory.create(request)).toEqual({ email: '', password: '' });
	});
});
