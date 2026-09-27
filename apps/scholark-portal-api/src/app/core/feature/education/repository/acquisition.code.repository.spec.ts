import { EntityRepository } from '@mikro-orm/core';

import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { User } from '../../user/model/user.entity';
import { AcquisitionCode } from '../model/acquisition.code.entity';
import { AcquisitionCodeRedemption } from '../model/acquisition.code.redemption.entity';
import { AcquisitionCodeRepository } from './acquisition.code.repository';

describe(AcquisitionCodeRepository.name, () => {
	it('records the same code redemption for multiple users', async () => {
		const acquisitionCode = { id: 'code-id' } as AcquisitionCode;
		const redemptionRepository = {
			findOne: jest.fn().mockResolvedValue(undefined),
		};
		const entityManager = {
			getRepository: jest.fn().mockReturnValue(redemptionRepository),
			getReference: jest.fn((entity, id) => ({ entity, id })),
			persist: jest.fn(),
			flush: jest.fn().mockResolvedValue(undefined),
		};
		const codeRepository = {
			findOne: jest.fn().mockResolvedValue(acquisitionCode),
			getEntityManager: jest.fn().mockReturnValue(entityManager),
		};
		const transactionContext = {
			getEntityManager: jest.fn().mockReturnValue(undefined),
		};
		const repository = new AcquisitionCodeRepository(
			codeRepository as unknown as EntityRepository<AcquisitionCode>,
			transactionContext as unknown as MikroOrmTransactionContext,
		);
		const redeemedAt = new Date();

		const firstRedemption = await repository.claim(acquisitionCode, 'user-one', redeemedAt);
		const secondRedemption = await repository.claim(acquisitionCode, 'user-two', redeemedAt);

		expect(firstRedemption).toBeInstanceOf(AcquisitionCodeRedemption);
		expect(secondRedemption).toBeInstanceOf(AcquisitionCodeRedemption);
		expect(firstRedemption).toMatchObject({ acquisitionCode, redeemedAt, redeemedBy: { entity: User, id: 'user-one' } });
		expect(secondRedemption).toMatchObject({ acquisitionCode, redeemedAt, redeemedBy: { entity: User, id: 'user-two' } });
		expect(entityManager.persist).toHaveBeenCalledTimes(2);
		expect(entityManager.flush).toHaveBeenCalledTimes(2);
	});
});