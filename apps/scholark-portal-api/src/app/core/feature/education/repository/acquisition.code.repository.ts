import { EntityRepository, LockMode } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { AcquisitionCode } from '../model/acquisition.code.entity';
import { AcquisitionCodeRedemption } from '../model/acquisition.code.redemption.entity';
import { InstitutionGameOffer } from '../model/institution.game.offer.entity';

@Injectable()
export class AcquisitionCodeRepository extends MikroOrmEntityRepository<AcquisitionCode> {

	constructor(
		@InjectRepository(AcquisitionCode) repository: EntityRepository<AcquisitionCode>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(AcquisitionCode, repository, transactionContext);
	}

	create(data: {
		code: string;
		institutionGameOffer: InstitutionGameOffer;
		expiresAt: Date;
	}): AcquisitionCode {
		return this.repository.create(data);
	}

	findForRedemption(code: string): Promise<AcquisitionCode | undefined> {
		return this.findOneBy({ code }, { relations: { institutionGameOffer: true } });
	}

	async claim(code: AcquisitionCode, userId: string, redeemedAt: Date): Promise<boolean> {
		const entityManager = this.repository.getEntityManager();
		const lockedCode = await this.repository.findOne(
			{ id: code.id },
			{ lockMode: LockMode.PESSIMISTIC_WRITE },
		);
		if (!lockedCode || lockedCode.revokedAt) {
			return false;
		}

		const redemptionRepository = entityManager.getRepository(AcquisitionCodeRedemption);
		const existingRedemption = await redemptionRepository.findOne({
			acquisitionCode: lockedCode,
			redeemedBy: userId,
		});
		if (existingRedemption) {
			return false;
		}

		await entityManager.insert(AcquisitionCodeRedemption, {
			acquisitionCode: lockedCode,
			redeemedBy: userId,
			redeemedAt,
		});
		return true;
	}

}
