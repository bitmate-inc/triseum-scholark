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
import { ClassroomGame } from '../../education/model/classroom.game.entity';
import { InstitutionContractGameOffer } from '../../education/model/institution.contract.game.offer.entity';
import { User } from '../../user/model/user.entity';
import { GameCustomization } from './game.customization.entity';
import { PublicGameOffer } from './public.game.offer.entity';

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

	@ManyToOne(() => PublicGameOffer, { deleteRule: 'restrict', nullable: true })
	publicOffer?: PublicGameOffer;

	@ManyToOne(() => InstitutionContractGameOffer, { deleteRule: 'restrict', nullable: true })
	institutionContractGameOffer?: InstitutionContractGameOffer;

	@ManyToOne(() => ClassroomGame, { deleteRule: 'restrict', nullable: true })
	classroomGame?: ClassroomGame;

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