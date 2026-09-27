import { Validator } from '../../../infrastructure/validation/validator/validator';
import { InstitutionGameOfferDesignatedPayor } from '../../education/model/institution.game.offer.entity';
import { AcquisitionCodeRepository } from '../../education/repository/acquisition.code.repository';
import { ClassroomGameRepository } from '../../education/repository/classroom.game.repository';
import { UserEntityRepository } from '../../user/repository/user.entity.repository';
import { GameAcquisitionEventType } from '../model/game.acquisition.event.entity';
import { GameAcquisitionEventRepository } from '../repository/game.acquisition.event.repository';
import { GameAcquisitionRepository } from '../repository/game.acquisition.repository';
import { GameLicenseRepository } from '../repository/game.license.repository';
import { RedeemAcquisitionCodeCommand, RedeemAcquisitionCodeCommandData } from './redeem.acquisition.code.command';

const userId = '00000000-0000-4000-8000-000000000001';
const classroomGameId = '00000000-0000-4000-8000-000000000002';
const offerId = '00000000-0000-4000-8000-000000000003';

function createDependencies() {
	const institutionGameOffer = {
		designatedPayor: InstitutionGameOfferDesignatedPayor.INSTITUTION,
		gameVariant: {},
		id: offerId,
		licenseDurationDays: 30,
		price: {},
	};
	const classroomGame = {
		classroom: { institution: {} },
		institutionGameOffer,
		customization: undefined,
		id: classroomGameId,
		isAvailable: () => true,
	};
	const acquisitionCode = {
		classroomGame,
		expiresAt: new Date(Date.now() + 86_400_000),
		id: '00000000-0000-4000-8000-000000000004',
	};
	const user = { id: userId };
	const redemption = {
		acquisitionCode,
		id: '00000000-0000-4000-8000-000000000007',
		redeemedAt: new Date(),
		redeemedBy: user,
	};
	const dependencies = {
		acquisitionCodeRepository: {
			claim: jest.fn().mockResolvedValue(redemption),
			findForRedemption: jest.fn().mockResolvedValue(acquisitionCode),
		} as unknown as AcquisitionCodeRepository,
		classroomGameRepository: {
			findForAcquisition: jest.fn().mockResolvedValue(classroomGame),
		} as unknown as ClassroomGameRepository,
		gameAcquisitionRepository: {
			save: jest.fn().mockImplementation(async (value) => value),
		} as unknown as GameAcquisitionRepository,
		acquisitionEventRepository: {
			save: jest.fn().mockImplementation(async (value) => value),
		} as unknown as GameAcquisitionEventRepository,
		gameLicenseRepository: {
			findByUserAndClassroomGame: jest.fn().mockResolvedValue(undefined),
			save: jest.fn().mockImplementation(async (value) => value),
		} as unknown as GameLicenseRepository,
		unitOfWork: {
			transactional: jest.fn().mockImplementation((callback: () => unknown) => callback()),
		},
		userRepository: {
			findOneBy: jest.fn().mockResolvedValue(user),
		} as unknown as UserEntityRepository,
	};
	const command = new RedeemAcquisitionCodeCommand(
		new Validator(),
		dependencies.acquisitionCodeRepository,
		dependencies.classroomGameRepository,
		dependencies.gameAcquisitionRepository,
		dependencies.acquisitionEventRepository,
		dependencies.gameLicenseRepository,
		dependencies.unitOfWork as never,
		dependencies.userRepository,
	);

	return { command, dependencies, acquisitionCode, classroomGame, redemption };
}

describe(RedeemAcquisitionCodeCommand.name, () => {
	it('validates command data before accessing repositories', async () => {
		const { command, dependencies } = createDependencies();

		const result = await command.execute(RedeemAcquisitionCodeCommandData.create({
			classroomGameId: 'not-a-classroom-id',
			code: '',
			userId: 'not-a-user-id',
		}));

		expect(result.validationResult?.errorList).toBeDefined();
		expect(dependencies.classroomGameRepository.findForAcquisition).not.toHaveBeenCalled();
	});

	it('creates an institution-funded license and claims the code', async () => {
		const { command, dependencies, classroomGame, redemption } = createDependencies();

		const result = await command.execute(RedeemAcquisitionCodeCommandData.create({
			classroomGameId,
			code: 'VALID-CODE',
			userId,
		}));

		expect(result.isSuccess()).toBe(true);
		expect(result.classroomGame).toBe(classroomGame);
		expect(result.license).toBeDefined();
		expect(dependencies.acquisitionCodeRepository.claim).toHaveBeenCalledWith(
			expect.objectContaining({ id: '00000000-0000-4000-8000-000000000004' }),
			userId,
			expect.any(Date),
		);
		expect(dependencies.gameAcquisitionRepository.save).toHaveBeenCalledWith(
			expect.objectContaining({ codeRedemption: redemption, mechanism: 'institution_funded' }),
		);
		expect(dependencies.acquisitionEventRepository.save).toHaveBeenCalledWith(
			expect.objectContaining({
				acquisitionCode: expect.objectContaining({ id: '00000000-0000-4000-8000-000000000004' }),
				actorType: 'user',
				eventType: GameAcquisitionEventType.CODE_REDEEMED,
			}),
		);
	});

	it('allows the same code to be redeemed by multiple users', async () => {
		const { command, dependencies } = createDependencies();
		const otherUserId = '00000000-0000-4000-8000-000000000005';

		const firstResult = await command.execute(RedeemAcquisitionCodeCommandData.create({
			classroomGameId,
			code: 'VALID-CODE',
			userId,
		}));
		(dependencies.userRepository.findOneBy as jest.Mock).mockResolvedValue({ id: otherUserId });
		const secondResult = await command.execute(RedeemAcquisitionCodeCommandData.create({
			classroomGameId,
			code: 'VALID-CODE',
			userId: otherUserId,
		}));

		expect(firstResult.isSuccess()).toBe(true);
		expect(secondResult.isSuccess()).toBe(true);
		expect(dependencies.acquisitionCodeRepository.claim).toHaveBeenCalledTimes(2);
		expect(dependencies.gameLicenseRepository.save).toHaveBeenCalledTimes(2);
	});

	it('rejects a code for a student-funded assignment', async () => {
		const { command, classroomGame } = createDependencies();
		classroomGame.institutionGameOffer.designatedPayor = InstitutionGameOfferDesignatedPayor.STUDENT;

		const result = await command.execute(RedeemAcquisitionCodeCommandData.create({
			classroomGameId,
			code: 'VALID-CODE',
			userId,
		}));

		expect(result.validationResult?.errorMessage).toContain('invalid or unavailable');
	});

	it('rejects a code used for a different classroom game with the same offer', async () => {
		const { command, dependencies } = createDependencies();
		const otherClassroomGameId = '00000000-0000-4000-8000-000000000006';
		(dependencies.classroomGameRepository.findForAcquisition as jest.Mock).mockResolvedValue({
			classroom: { institution: {} },
			institutionGameOffer: { designatedPayor: InstitutionGameOfferDesignatedPayor.INSTITUTION, id: offerId },
			id: otherClassroomGameId,
			isAvailable: () => true,
		});

		const result = await command.execute(RedeemAcquisitionCodeCommandData.create({
			classroomGameId: otherClassroomGameId,
			code: 'VALID-CODE',
			userId,
		}));

		expect(result.validationResult?.errorMessage).toContain('invalid or unavailable');
		expect(dependencies.acquisitionCodeRepository.claim).not.toHaveBeenCalled();
	});

	it('rejects a code when this user cannot claim it', async () => {
		const { command, dependencies } = createDependencies();
		(dependencies.acquisitionCodeRepository.claim as jest.Mock).mockResolvedValue(false);

		const result = await command.execute(RedeemAcquisitionCodeCommandData.create({
			classroomGameId,
			code: 'VALID-CODE',
			userId,
		}));

		expect(result.validationResult?.errorMessage).toContain('invalid or unavailable');
		expect(dependencies.gameLicenseRepository.save).not.toHaveBeenCalled();
	});
});
