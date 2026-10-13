import { ClassroomGameListing } from '../../education/model/classroom.game.listing.entity';
import { Game } from '../model/game.entity';
import { GameVersion } from '../model/game.version.entity';
import { AcquireClassroomGameListingCommand, AcquireClassroomGameListingCommandData } from './acquire.classroom.game.listing.command';

const userId = '00000000-0000-4000-8000-000000000001';
const classroomGameListingId = '00000000-0000-4000-8000-000000000002';
const gameVersionId = '00000000-0000-4000-8000-000000000003';

function createContext({
	createdAt = new Date('2024-06-01T00:00:00.000Z'),
	endAt = new Date('2024-07-01T00:00:00.000Z'),
	gamePublishedAt = new Date('2024-01-01T00:00:00.000Z'),
	versionPublishedAt = new Date('2024-01-01T00:00:00.000Z'),
} = {}) {
	const user = { id: userId };
	const game = Object.assign(new Game(), { publishedAt: gamePublishedAt });
	const gameVersion = Object.assign(new GameVersion(), { game, id: gameVersionId, publishedAt: versionPublishedAt });
	const classroomGameListing = Object.assign(new ClassroomGameListing(), {
		classroom: { institution: {} },
		courseType: 'standard',
		designatedPayor: 'student',
		endAt,
		gameVersion,
		id: classroomGameListingId,
		language: 'en',
		licenseDurationDays: 180,
		publishedAt: new Date('2024-01-01T00:00:00.000Z'),
		startAt: new Date('2024-01-01T00:00:00.000Z'),
	});
	const paymentAttempt = {
		classroomGameListing: { id: classroomGameListingId },
		createdAt,
		courseType: 'standard',
		customization: undefined,
		language: 'en',
		licenseDurationDays: 180,
		user,
	};
	const userRepository = { findOneBy: jest.fn().mockResolvedValue(undefined) };
	const command = new AcquireClassroomGameListingCommand(
		{ validate: jest.fn().mockResolvedValue(undefined) } as never,
		{ findForLicenseIssuance: jest.fn().mockResolvedValue(classroomGameListing) } as never,
		{ findByUserAndClassroomGameListing: jest.fn() } as never,
		{ save: jest.fn() } as never,
		{ transactional: jest.fn((work: () => Promise<unknown>) => work()) } as never,
		userRepository as never,
	);

	return { classroomGameListing, command, game, gameVersion, paymentAttempt, userRepository };
}

function execute(context: ReturnType<typeof createContext>) {
	return context.command.execute(AcquireClassroomGameListingCommandData.create({
		classroomGameListingId,
		paymentAttempt: context.paymentAttempt as never,
		userId,
	}));
}

describe(AcquireClassroomGameListingCommand.name, () => {
	it('checks listing availability at the payment-attempt time', async () => {
		const context = createContext();
		const canBeAcquired = jest.spyOn(context.classroomGameListing, 'canBeAcquired');
		const result = await execute(context);

		expect(canBeAcquired).toHaveBeenCalledWith(context.paymentAttempt.createdAt);
		expect(result.validationResult?.errorMessage).toContain('User not found');
	});

	it('rejects an attempt created outside the classroom listing window', async () => {
		const context = createContext({
			createdAt: new Date('2024-08-01T00:00:00.000Z'),
		});
		const result = await execute(context);

		expect(result.validationResult?.errorMessage).toContain('Classroom game listing not found');
		expect(context.userRepository.findOneBy).not.toHaveBeenCalled();
	});

	it.each([
		['game', { gamePublishedAt: new Date('2024-07-01T00:00:00.000Z') }],
		['game version', { versionPublishedAt: new Date('2024-07-01T00:00:00.000Z') }],
	] as const)('rejects an attempt created before the %s was published', async (_label, overrides) => {
		const context = createContext(overrides);
		const result = await execute(context);

		expect(result.validationResult?.errorMessage).toContain('Classroom game listing not found');
		expect(context.userRepository.findOneBy).not.toHaveBeenCalled();
	});
});