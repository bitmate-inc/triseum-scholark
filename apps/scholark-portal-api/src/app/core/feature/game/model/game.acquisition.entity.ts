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
import { ClassroomGameListing } from '../../education/model/classroom.game.listing.entity';
import { User } from '../../user/model/user.entity';
import { GameLicense } from './game.license.entity';
import { GamePaymentAttempt } from './game.payment.attempt.entity';
import { PublicGameListing } from './public.game.listing.entity';

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

	@ManyToOne(() => PublicGameListing, { deleteRule: 'restrict', nullable: true })
	publicListing?: PublicGameListing;

	@ManyToOne(() => ClassroomGameListing, { deleteRule: 'restrict', nullable: true })
	classroomGameListing?: ClassroomGameListing;

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
