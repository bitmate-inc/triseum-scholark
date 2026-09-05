import { BCryptPasswordEncoder } from './bcrypt.password-encoder';

describe(BCryptPasswordEncoder.name, () => {
	const encoder = new BCryptPasswordEncoder();

	it('encodes and compares a password without retaining the plaintext', async () => {
		const hash = await encoder.encode('correct horse battery staple');

		expect(hash).toMatch(/^\$2[aby]\$/);
		expect(hash).not.toContain('correct horse battery staple');
		await expect(encoder.isEqual(hash, 'correct horse battery staple')).resolves.toBe(true);
		await expect(encoder.isEqual(hash, 'incorrect password')).resolves.toBe(false);
	});

	it('rejects malformed password hashes', async () => {
		await expect(encoder.isEqual('not-a-supported-hash', 'password')).resolves.toBe(false);
	});
});
