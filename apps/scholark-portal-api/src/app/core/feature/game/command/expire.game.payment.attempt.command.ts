import { Injectable } from '@nestjs/common';

import { MikroOrmUnitOfWork } from '../../../../../lib/database/mikro.orm.unit.of.work';
import { GamePaymentAttemptStatus } from '../model/game.payment.attempt.entity';
import { GamePaymentAttemptRepository } from '../repository/game.payment.attempt.repository';

@Injectable()
export class ExpireGamePaymentAttemptCommand {

	constructor(
		private readonly paymentAttemptRepository: GamePaymentAttemptRepository,
		private readonly unitOfWork: MikroOrmUnitOfWork,
	) {}

	async execute(sessionId: string, attemptId?: string): Promise<void> {
		await this.unitOfWork.transactional(async () => {
			let attempt = attemptId
				? await this.paymentAttemptRepository.findByIdForUpdate(attemptId)
				: await this.paymentAttemptRepository.findByCheckoutSessionIdForUpdate(sessionId);

			if (!attempt) {
				throw new Error('Payment attempt not found for expired Checkout session');
			}
			if (attemptId && attempt.id !== attemptId) {
				throw new Error('Stripe Checkout attempt metadata does not match the payment attempt');
			}
			if (attempt.stripeCheckoutSessionId && attempt.stripeCheckoutSessionId !== sessionId) {
				throw new Error('Stripe Checkout session does not match the payment attempt');
			}
			if (attempt.status !== GamePaymentAttemptStatus.PENDING) {
				return;
			}

			attempt.stripeCheckoutSessionId = sessionId;
			attempt.status = GamePaymentAttemptStatus.FAILED;
			await this.paymentAttemptRepository.save(attempt);
		});
	}

}