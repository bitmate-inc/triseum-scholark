import { EntityRepository, LockMode } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { User } from '../../user/model/user.entity';
import { AcquisitionCode } from '../model/acquisition.code.entity';
import { AcquisitionCodeRedemption } from '../model/acquisition.code.redemption.entity';
import { ClassroomGame } from '../model/classroom.game.entity';

@Injectable()
export class AcquisitionCodeRepository extends MikroOrmEntityRepository<AcquisitionCode> {

	constructor(
		@InjectRepository(AcquisitionCode) repository: EntityRepository<AcquisitionCode>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(AcquisitionCode, repository, transactionContext);
	}

	create(data: {
		codeDigest: string;
		codeSuffix: string;
		classroomGame: ClassroomGame;
		expiresAt: Date;
	}): AcquisitionCode {
		return this.repository.create(data);
	}

	findForRedemption(codeDigest: string): Promise<AcquisitionCode | undefined> {
		return this.findOneBy({ codeDigest }, { relations: { classroomGame: true } });
	}

	async findForRevocation(id: string): Promise<AcquisitionCode | undefined> {
		return (await this.repository.findOne(
			{ id },
			{ lockMode: LockMode.PESSIMISTIC_WRITE },
		)) ?? undefined;
	}

	async claim(code: AcquisitionCode, userId: string, redeemedAt: Date): Promise<AcquisitionCodeRedemption | undefined> {
		const entityManager = this.repository.getEntityManager();
		const lockedCode = await this.repository.findOne(
			{ id: code.id },
			{ lockMode: LockMode.PESSIMISTIC_WRITE },
		);
		if (!lockedCode || lockedCode.revokedAt) {
			return undefined;
		}

		const redemptionRepository = entityManager.getRepository(AcquisitionCodeRedemption);
		const existingRedemption = await redemptionRepository.findOne({
			acquisitionCode: lockedCode,
			redeemedBy: userId,
		});
		if (existingRedemption) {
			return undefined;
		}

		const redemption = new AcquisitionCodeRedemption();
		redemption.acquisitionCode = lockedCode;
		redemption.redeemedBy = entityManager.getReference(User, userId);
		redemption.redeemedAt = redeemedAt;
		entityManager.persist(redemption);
		await entityManager.flush();
		return redemption;
	}

}
