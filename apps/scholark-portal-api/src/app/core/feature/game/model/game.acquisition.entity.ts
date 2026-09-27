import {
	Embedded,
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { Money } from '../../../shared/commerce/model/money.entity';
import { AcquisitionCodeRedemption } from '../../education/model/acquisition.code.redemption.entity';
import { InstitutionGameOffer } from '../../education/model/institution.game.offer.entity';
import { User } from '../../user/model/user.entity';
import { GameLicense } from './game.license.entity';
import { GamePaymentAttempt } from './game.payment.attempt.entity';
import { PublicGameOffer } from './public.game.offer.entity';

export enum GameAcquisitionMechanism {
	USER_PAID = 'user_paid',
	INSTITUTION_FUNDED = 'institution_funded',
	COMPLIMENTARY = 'complimentary',
}

@Entity({ tableName: 'game_acquisition' })
export class GameAcquisition extends StaticFactory {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => User, { deleteRule: 'restrict' })
	user!: User;

	@ManyToOne(() => PublicGameOffer, { deleteRule: 'restrict', nullable: true })
	publicOffer?: PublicGameOffer;

	@ManyToOne(() => InstitutionGameOffer, { deleteRule: 'restrict', nullable: true })
	institutionGameOffer?: InstitutionGameOffer;

	@ManyToOne(() => GameLicense, { deleteRule: 'restrict' })
	license!: GameLicense;

	@ManyToOne(() => AcquisitionCodeRedemption, { deleteRule: 'restrict', nullable: true, unique: true })
	codeRedemption?: AcquisitionCodeRedemption;

	@ManyToOne(() => GamePaymentAttempt, { deleteRule: 'restrict', nullable: true, unique: true })
	paymentAttempt?: GamePaymentAttempt;

	@Property({ type: 'string' })
	mechanism!: GameAcquisitionMechanism;

	@Embedded(() => Money, { prefix: 'price_' })
	price!: Money;

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

}
