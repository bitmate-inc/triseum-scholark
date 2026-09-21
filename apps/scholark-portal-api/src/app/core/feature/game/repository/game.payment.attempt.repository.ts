import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { GamePaymentAttempt } from '../model/game.payment.attempt.entity';

@Injectable()
export class GamePaymentAttemptRepository extends MikroOrmEntityRepository<GamePaymentAttempt> {

	constructor(
		@InjectRepository(GamePaymentAttempt) repository: EntityRepository<GamePaymentAttempt>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(GamePaymentAttempt, repository, transactionContext);
	}

	async findByCheckoutSessionId(stripeCheckoutSessionId: string): Promise<GamePaymentAttempt | undefined> {
		return (await this.repository.findOne(
			{ stripeCheckoutSessionId },
			{ populate: ['classroomGame'] },
		)) ?? undefined;
	}

	async findById(id: string): Promise<GamePaymentAttempt | undefined> {
		return (await this.repository.findOne(
			{ id },
			{ populate: ['classroomGame', 'customization'] },
		)) ?? undefined;
	}

	async findByCheckoutSessionIdAndUser(
		stripeCheckoutSessionId: string,
		userId: string,
	): Promise<GamePaymentAttempt | undefined> {
		return (await this.repository.findOne(
			{ stripeCheckoutSessionId, user: userId },
			{ populate: ['classroomGame', 'customization'] },
		)) ?? undefined;
	}

}