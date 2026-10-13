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
			{ populate: ['classroomGameListing', 'publicListing'] },
		)) ?? undefined;
	}

	async findById(id: string): Promise<GamePaymentAttempt | undefined> {
		return (await this.repository.findOne(
			{ id },
			{ populate: ['classroomGameListing', 'customization', 'publicListing'] },
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
					'publicListing.gameVersion.game',
					'classroomGameListing.gameVersion.game',
				],
			},
		);
	}

	async findByIdAndUser(id: string, userId: string): Promise<GamePaymentAttempt | undefined> {
		return (await this.repository.findOne(
			{ id, user: userId },
			{
				populate: [
					'publicListing.gameVersion.game',
					'classroomGameListing.gameVersion.game',
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
			{ populate: ['classroomGameListing', 'customization', 'publicListing'] },
		)) ?? undefined;
	}

	async findPendingByUserAndPublicListing(userId: string, publicListingId: string, language: string): Promise<GamePaymentAttempt | undefined> {
		return (await this.repository.findOne(
			{ language, publicListing: publicListingId, status: GamePaymentAttemptStatus.PENDING, user: userId },
			{ orderBy: { createdAt: 'DESC' }, populate: ['user', 'publicListing'] },
		)) ?? undefined;
	}

	async findPendingByUserAndClassroomGameListing(userId: string, classroomGameListingId: string): Promise<GamePaymentAttempt | undefined> {
		return (await this.repository.findOne(
			{ classroomGameListing: classroomGameListingId, status: GamePaymentAttemptStatus.PENDING, user: userId },
			{ orderBy: { createdAt: 'DESC' }, populate: ['user', 'classroomGameListing'] },
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