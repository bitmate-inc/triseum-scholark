import { Validator } from '../../../infrastructure/validation/validator/validator';
import { GameLicenseRepository } from '../repository/game.license.repository';
import { GetGameLaunchQuery, GetGameLaunchQueryData } from './get.game.launch.query';

const userId = '00000000-0000-4000-8000-000000000001';
const licenseId = '00000000-0000-4000-8000-000000000002';

function createQuery() {
	const license = {
		gameVariant: {
			gameVersion: {
				game: {},
				id: '00000000-0000-4000-8000-000000000003',
				isPublished: () => true,
				runUrl: 'https://play.triseum.com/arte-mecenas',
			},
		},
		endAt: new Date(Date.now() + 86_400_000),
		id: licenseId,
		isActive: () => true,
	};
	const repository = {
		findOwnedById: jest.fn().mockResolvedValue(license),
	} as unknown as GameLicenseRepository;
	const jwtService = { signAsync: jest.fn().mockResolvedValue('signed-launch-token') };
	const query = new GetGameLaunchQuery(repository, jwtService as never, new Validator());

	return { jwtService, license, query, repository };
}

describe(GetGameLaunchQuery.name, () => {
	it('returns the stored exact-version launch URL for an owned active license', async () => {
		const { jwtService, license, query, repository } = createQuery();

		const result = await query.execute(GetGameLaunchQueryData.create({ licenseId, userId }));

		expect(result.isSuccess()).toBe(true);
		expect(result.launchUrl).toContain('launch_token=signed-launch-token');
		expect(jwtService.signAsync).toHaveBeenCalledWith(
			expect.objectContaining({ gameVersionId: license.gameVariant.gameVersion.id, licenseId, sub: userId }),
			expect.objectContaining({ expiresIn: expect.any(Number) }),
		);
		expect(result.license).toBe(license);
		expect(repository.findOwnedById).toHaveBeenCalledWith(userId, licenseId);
	});

	it('rejects an inactive license', async () => {
		const { query, repository } = createQuery();
		(repository.findOwnedById as jest.Mock).mockResolvedValue({
			gameVariant: { gameVersion: { isPublished: () => true } },
			isActive: () => false,
		});

		const result = await query.execute(GetGameLaunchQueryData.create({ licenseId, userId }));

		expect(result.validationResult?.errorMessage).toContain('unavailable for launch');
	});

	it('rejects an unpublished Game Version', async () => {
		const { query, repository } = createQuery();
		(repository.findOwnedById as jest.Mock).mockResolvedValue({
			gameVariant: { gameVersion: { isPublished: () => false } },
			isActive: () => true,
		});

		const result = await query.execute(GetGameLaunchQueryData.create({ licenseId, userId }));

		expect(result.validationResult?.errorMessage).toContain('unavailable for launch');
	});
});
