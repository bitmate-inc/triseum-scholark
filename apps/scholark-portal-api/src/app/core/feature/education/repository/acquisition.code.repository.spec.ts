import { EntityRepository } from '@mikro-orm/core';

import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
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
			insert: jest.fn().mockResolvedValue('redemption-id'),
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

		await expect(repository.claim(acquisitionCode, 'user-one', redeemedAt)).resolves.toBe(true);
		await expect(repository.claim(acquisitionCode, 'user-two', redeemedAt)).resolves.toBe(true);

		expect(entityManager.insert).toHaveBeenNthCalledWith(1, AcquisitionCodeRedemption, {
			acquisitionCode,
			redeemedBy: 'user-one',
			redeemedAt,
		});
		expect(entityManager.insert).toHaveBeenNthCalledWith(2, AcquisitionCodeRedemption, {
			acquisitionCode,
			redeemedBy: 'user-two',
			redeemedAt,
		});
	});
});