import { EntityRepository, LockMode } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { GamePaymentAttempt, GamePaymentAttemptStatus } from '../model/game.payment.attempt.entity';

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

	async findByIdForUpdate(id: string): Promise<GamePaymentAttempt | undefined> {
		const attempt = await this.repository.findOne({ id }, { lockMode: LockMode.PESSIMISTIC_WRITE, refresh: true });
		return attempt ? this.findById(id) : undefined;
	}

	async findByCheckoutSessionIdForUpdate(stripeCheckoutSessionId: string): Promise<GamePaymentAttempt | undefined> {
		const attempt = await this.repository.findOne(
			{ stripeCheckoutSessionId },
			{ lockMode: LockMode.PESSIMISTIC_WRITE, refresh: true },
		);
		return attempt ? this.findByCheckoutSessionId(stripeCheckoutSessionId) : undefined;
	}

	async findAllByUserId(userId: string): Promise<GamePaymentAttempt[]> {
		return this.repository.find(
			{ user: userId },
			{
				orderBy: { createdAt: 'DESC' },
				populate: [
					'publicOffer.gameVariant.gameVersion.game',
					'institutionGameOffer.gameVariant.gameVersion.game',
					'classroomGame.institutionGameOffer.gameVariant.gameVersion.game',
				],
			},
		);
	}

	async findByIdAndUser(id: string, userId: string): Promise<GamePaymentAttempt | undefined> {
		return (await this.repository.findOne(
			{ id, user: userId },
			{
				populate: [
					'publicOffer.gameVariant.gameVersion.game',
					'institutionGameOffer.gameVariant.gameVersion.game',
					'classroomGame.institutionGameOffer.gameVariant.gameVersion.game',
				],
			},
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

	async findPendingByUserAndPublicOffer(userId: string, publicOfferId: string): Promise<GamePaymentAttempt | undefined> {
		return (await this.repository.findOne(
			{ publicOffer: publicOfferId, status: GamePaymentAttemptStatus.PENDING, user: userId },
			{ orderBy: { createdAt: 'DESC' }, populate: ['user', 'publicOffer'] },
		)) ?? undefined;
	}

	async findPendingByUserAndClassroomGame(userId: string, classroomGameId: string): Promise<GamePaymentAttempt | undefined> {
		return (await this.repository.findOne(
			{ classroomGame: classroomGameId, status: GamePaymentAttemptStatus.PENDING, user: userId },
			{ orderBy: { createdAt: 'DESC' }, populate: ['user', 'classroomGame', 'institutionGameOffer'] },
		)) ?? undefined;
	}

	async markPendingAsFailed(id: string, stripeCheckoutSessionId?: string): Promise<boolean> {
		const condition: { id: string; status: GamePaymentAttemptStatus; stripeCheckoutSessionId?: string } = {
			id,
			status: GamePaymentAttemptStatus.PENDING,
		};
		if (stripeCheckoutSessionId) {
			condition.stripeCheckoutSessionId = stripeCheckoutSessionId;
		}
		return await this.repository.nativeUpdate(condition, { status: GamePaymentAttemptStatus.FAILED }) === 1;
	}

}