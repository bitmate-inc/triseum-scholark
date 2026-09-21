import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { StripeWebhookEvent, StripeWebhookEventStatus } from '../model/stripe.webhook.event.entity';

@Injectable()
export class StripeWebhookEventRepository extends MikroOrmEntityRepository<StripeWebhookEvent> {

	constructor(
		@InjectRepository(StripeWebhookEvent) repository: EntityRepository<StripeWebhookEvent>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(StripeWebhookEvent, repository, transactionContext);
	}

	findByStripeEventId(stripeEventId: string): Promise<StripeWebhookEvent | undefined> {
		return this.findOneBy({ stripeEventId });
	}

	async claimFailed(stripeEventId: string): Promise<boolean> {
		return await this.repository.nativeUpdate(
			{ stripeEventId, status: StripeWebhookEventStatus.FAILED },
			{ failureMessage: null, processedAt: null, status: StripeWebhookEventStatus.PENDING },
		) === 1;
	}

}