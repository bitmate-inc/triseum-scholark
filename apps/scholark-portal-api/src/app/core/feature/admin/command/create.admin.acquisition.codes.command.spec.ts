import { MikroOrmUnitOfWork } from '../../../../../lib/database/mikro.orm.unit.of.work';
import { digestAcquisitionCode, getAcquisitionCodeSuffix } from '../../education/model/acquisition.code.util';
import { InstitutionGameOfferDesignatedPayor } from '../../education/model/institution.game.offer.entity';
import { AcquisitionCodeRepository } from '../../education/repository/acquisition.code.repository';
import { ClassroomGameRepository } from '../../education/repository/classroom.game.repository';
import { GameAcquisitionEventActorType, GameAcquisitionEventType } from '../../game/model/game.acquisition.event.entity';
import { GameAcquisitionEventRepository } from '../../game/repository/game.acquisition.event.repository';
import { UserEntityRepository } from '../../user/repository/user.entity.repository';
import { CreateAdminAcquisitionCodesCommand } from './create.admin.acquisition.codes.command';

describe(CreateAdminAcquisitionCodesCommand.name, () => {
	it('reveals generated codes once, persists only digests, and records the issuing Admin', async () => {
		const classroomGame = {
			id: '00000000-0000-4000-8000-000000000001',
			institutionGameOffer: { designatedPayor: InstitutionGameOfferDesignatedPayor.INSTITUTION },
		};
		const actorUser = { id: '00000000-0000-4000-8000-000000000002' };
		const acquisitionCodeRepository = {
			create: jest.fn((data) => data),
			saveBatch: jest.fn().mockResolvedValue([]),
		};
		const classroomGameRepository = { findOneBy: jest.fn().mockResolvedValue(classroomGame) };
		const acquisitionEventRepository = { saveBatch: jest.fn().mockResolvedValue([]) };
		const userRepository = { findOneBy: jest.fn().mockResolvedValue(actorUser) };
		const unitOfWork = {
			transactional: jest.fn((work: () => Promise<unknown>) => work()),
		};
		const command = new CreateAdminAcquisitionCodesCommand(
			acquisitionCodeRepository as unknown as AcquisitionCodeRepository,
			classroomGameRepository as unknown as ClassroomGameRepository,
			acquisitionEventRepository as unknown as GameAcquisitionEventRepository,
			userRepository as unknown as UserEntityRepository,
			unitOfWork as unknown as MikroOrmUnitOfWork,
		);

		const codeList = await command.execute({
			classroomGameId: classroomGame.id,
			expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
			quantity: 2,
		}, actorUser.id);

		expect(codeList).toHaveLength(2);
		expect(acquisitionCodeRepository.saveBatch).toHaveBeenCalledTimes(1);
		const persistedCodeList = acquisitionCodeRepository.create.mock.results.map(({ value }) => value);
		for (const [index, persistedCode] of persistedCodeList.entries()) {
			expect(persistedCode).toMatchObject({
				codeDigest: digestAcquisitionCode(codeList[index]),
				codeSuffix: getAcquisitionCodeSuffix(codeList[index]),
			});
			expect(persistedCode).not.toHaveProperty('code');
		}
		const eventList = acquisitionEventRepository.saveBatch.mock.calls[0][0];
		expect(eventList).toHaveLength(2);
		expect(eventList[0]).toMatchObject({
			actorType: GameAcquisitionEventActorType.ADMIN,
			actorUser,
			eventType: GameAcquisitionEventType.CODE_ISSUED,
		});
	});
});