import {
	Entity,
	Enum,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

import { StaticFactory } from '../../../../../lib/factory/static.factory';

export enum StripeWebhookEventStatus {
	PENDING = 'pending',
	PROCESSED = 'processed',
	FAILED = 'failed',
}

@Entity({ tableName: 'stripe_webhook_event' })
export class StripeWebhookEvent extends StaticFactory {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@Property({ unique: true })
	stripeEventId!: string;

	@Property()
	eventType!: string;

	@Enum(() => StripeWebhookEventStatus)
	status!: StripeWebhookEventStatus;

	@Property({ nullable: true })
	failureMessage?: string;

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

	@Property({ nullable: true })
	processedAt?: Date;

}