import { BadRequestException } from '@nestjs/common';

import { MikroOrmUnitOfWork } from '../../../../../lib/database/mikro.orm.unit.of.work';
import { AcquisitionCode } from '../../education/model/acquisition.code.entity';
import { AcquisitionCodeRepository } from '../../education/repository/acquisition.code.repository';
import { GameAcquisitionEventActorType, GameAcquisitionEventType } from '../../game/model/game.acquisition.event.entity';
import { GameAcquisitionEventRepository } from '../../game/repository/game.acquisition.event.repository';
import { UserEntityRepository } from '../../user/repository/user.entity.repository';
import { RevokeAdminAcquisitionCodeCommand } from './revoke.admin.acquisition.code.command';

const codeId = '00000000-0000-4000-8000-000000000001';
const actorUserId = '00000000-0000-4000-8000-000000000002';

function createCommand() {
	const acquisitionCode = { codeSuffix: 'AB12', id: codeId } as AcquisitionCode;
	const actorUser = { id: actorUserId };
	const acquisitionCodeRepository = {
		findForRevocation: jest.fn().mockResolvedValue(acquisitionCode),
		save: jest.fn().mockResolvedValue(acquisitionCode),
	};
	const acquisitionEventRepository = { save: jest.fn().mockImplementation(async (event) => event) };
	const userRepository = { findOneBy: jest.fn().mockResolvedValue(actorUser) };
	const unitOfWork = {
		transactional: jest.fn((work: () => Promise<unknown>) => work()),
	} as unknown as MikroOrmUnitOfWork;
	const command = new RevokeAdminAcquisitionCodeCommand(
		acquisitionCodeRepository as unknown as AcquisitionCodeRepository,
		acquisitionEventRepository as unknown as GameAcquisitionEventRepository,
		userRepository as unknown as UserEntityRepository,
		unitOfWork,
	);
	return { acquisitionCode, actorUser, acquisitionCodeRepository, acquisitionEventRepository, command, userRepository };
}

describe(RevokeAdminAcquisitionCodeCommand.name, () => {
	it('locks the code and records the actor and reason in an audit event', async () => {
		const { acquisitionCode, actorUser, acquisitionEventRepository, command, acquisitionCodeRepository } = createCommand();

		await command.execute(codeId, actorUserId, 'Duplicate distribution');

		expect(acquisitionCode.revokedAt).toBeInstanceOf(Date);
		expect(acquisitionCodeRepository.findForRevocation).toHaveBeenCalledWith(codeId);
		expect(acquisitionEventRepository.save).toHaveBeenCalledWith(expect.objectContaining({
			acquisitionCode,
			actorType: GameAcquisitionEventActorType.ADMIN,
			actorUser,
			eventType: GameAcquisitionEventType.CODE_REVOKED,
			metadata: { codeSuffix: 'AB12' },
			reason: 'Duplicate distribution',
		}));
	});

	it('rejects a blank reason before starting a transaction', async () => {
		const { command } = createCommand();

		await expect(command.execute(codeId, actorUserId, '   ')).rejects.toThrow(BadRequestException);
	});
});