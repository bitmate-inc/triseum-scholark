import {
	Embedded,
	Entity,
	Enum,
	ManyToOne,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { Money } from '../../../shared/commerce/model/money.entity';
import { ClassroomGameListing } from '../../education/model/classroom.game.listing.entity';
import { User } from '../../user/model/user.entity';
import { GameCustomization } from './game.customization.entity';
import { PublicGameListing } from './public.game.listing.entity';

export enum GamePaymentAttemptStatus {
	PENDING = 'pending',
	FULFILLED = 'fulfilled',
	FAILED = 'failed',
}

@Entity({ tableName: 'game_payment_attempt' })
export class GamePaymentAttempt extends StaticFactory {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => User, { deleteRule: 'restrict' })
	user!: User;

	@ManyToOne(() => PublicGameListing, { deleteRule: 'restrict', nullable: true })
	publicListing?: PublicGameListing;

	@ManyToOne(() => ClassroomGameListing, { deleteRule: 'restrict', nullable: true })
	classroomGameListing?: ClassroomGameListing;

	@Property({ nullable: true, unique: true })
	stripeCheckoutSessionId?: string;

	@Property({ nullable: true })
	stripePaymentIntentId?: string;

	@Enum(() => GamePaymentAttemptStatus)
	status: GamePaymentAttemptStatus = GamePaymentAttemptStatus.PENDING;

	@Embedded(() => Money, { prefix: 'price_' })
	price!: Money;

	@Property()
	licenseDurationDays!: number;

	@ManyToOne(() => GameCustomization, { deleteRule: 'restrict', nullable: true })
	customization?: GameCustomization;

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

	@Property({ nullable: true })
	fulfilledAt?: Date;

}