import { Game } from '../model/game.entity';
import { GameVersion } from '../model/game.version.entity';
import { PublicGameListing } from '../model/public.game.listing.entity';
import { AcquirePublicListingCommand, AcquirePublicListingCommandData } from './acquire.public.game.listing.command';

const userId = '00000000-0000-4000-8000-000000000001';
const publicListingId = '00000000-0000-4000-8000-000000000002';
const gameVersionId = '00000000-0000-4000-8000-000000000003';

function createContext({
	createdAt = new Date('2024-06-01T00:00:00.000Z'),
	gamePublishedAt = new Date('2024-01-01T00:00:00.000Z'),
	listingEndAt = new Date('2024-07-01T00:00:00.000Z'),
	listingEndAtSnapshot,
	versionPublishedAt = new Date('2024-01-01T00:00:00.000Z'),
}: {
	createdAt?: Date;
	gamePublishedAt?: Date;
	listingEndAt?: Date;
	listingEndAtSnapshot?: Date | null;
	versionPublishedAt?: Date;
} = {}) {
	const snapshotEndAt = listingEndAtSnapshot === undefined ? listingEndAt : listingEndAtSnapshot;
	const user = { id: userId };
	const game = Object.assign(new Game(), { publishedAt: gamePublishedAt });
	const gameVersion = Object.assign(new GameVersion(), { game, id: gameVersionId, publishedAt: versionPublishedAt });
	const publicListing = Object.assign(new PublicGameListing(), {
		endAt: listingEndAt,
		gameVersion,
		id: publicListingId,
		isAvailable: true,
		publishedAt: new Date('2024-01-01T00:00:00.000Z'),
		startAt: new Date('2024-01-01T00:00:00.000Z'),
	});
	const paymentAttempt = {
		createdAt,
		courseType: 'standard',
		language: 'en',
		licenseDurationDays: 180,
		price: { currency: 'USD', minorUnitAmount: 1200 },
		publicListingEndAtSnapshot: snapshotEndAt,
		publicListingEndAtSnapshotted: true,
		publicListing: { id: publicListingId },
		user,
	};
	const userRepository = { findOneBy: jest.fn().mockResolvedValue(undefined) };
	const command = new AcquirePublicListingCommand(
		{ validate: jest.fn().mockResolvedValue(undefined) } as never,
		{ findForAcquisition: jest.fn().mockResolvedValue(publicListing) } as never,
		{ findActiveByUserAndConfiguration: jest.fn() } as never,
		{ save: jest.fn() } as never,
		userRepository as never,
		{ findOneBy: jest.fn() } as never,
	);

	return { command, game, gameVersion, paymentAttempt, publicListing, userRepository };
}

describe(AcquirePublicListingCommand.name, () => {
	it('uses the payment-attempt time to validate the listing window', async () => {
		const context = createContext();
		const canBeAcquired = jest.spyOn(context.publicListing, 'canBeAcquired');
		const result = await context.command.execute(AcquirePublicListingCommandData.create({
			paymentAttempt: context.paymentAttempt as never,
			publicListingId,
			userId,
		}));

		expect(canBeAcquired).toHaveBeenCalledWith(
			context.paymentAttempt.createdAt,
			context.paymentAttempt.publicListingEndAtSnapshot,
		);
		expect(result.validationResult?.errorMessage).toContain('User not found');
	});

	it('rejects a payment attempt made after the public listing closed', async () => {
		const context = createContext({
			createdAt: new Date('2024-08-01T00:00:00.000Z'),
		});
		const result = await context.command.execute(AcquirePublicListingCommandData.create({
			paymentAttempt: context.paymentAttempt as never,
			publicListingId,
			userId,
		}));

		expect(result.validationResult?.errorMessage).toContain('Game version not found');
		expect(context.userRepository.findOneBy).not.toHaveBeenCalled();
	});

	it('honors the listing end date captured before an admin closed it early', async () => {
		const context = createContext({
			listingEndAt: new Date('2024-05-01T00:00:00.000Z'),
			listingEndAtSnapshot: new Date('2024-07-01T00:00:00.000Z'),
		});
		const canBeAcquired = jest.spyOn(context.publicListing, 'canBeAcquired');
		const result = await context.command.execute(AcquirePublicListingCommandData.create({
			paymentAttempt: context.paymentAttempt as never,
			publicListingId,
			userId,
		}));

		expect(canBeAcquired).toHaveBeenCalledWith(
			context.paymentAttempt.createdAt,
			context.paymentAttempt.publicListingEndAtSnapshot,
		);
		expect(result.validationResult?.errorMessage).toContain('User not found');
	});

	it('rejects a payment attempt made before the game was published', async () => {
		const context = createContext({
			gamePublishedAt: new Date('2024-07-01T00:00:00.000Z'),
		});
		const isPublished = jest.spyOn(context.game, 'isPublished');
		const result = await context.command.execute(AcquirePublicListingCommandData.create({
			paymentAttempt: context.paymentAttempt as never,
			publicListingId,
			userId,
		}));

		expect(isPublished).toHaveBeenCalledWith(context.paymentAttempt.createdAt);
		expect(result.validationResult?.errorMessage).toContain('Game version not found');
	});
});