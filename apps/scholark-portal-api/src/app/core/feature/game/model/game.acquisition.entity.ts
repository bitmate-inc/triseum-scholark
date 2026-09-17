import {
	Embedded,
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { Money } from '../../../shared/commerce/model/money.entity';
import { User } from '../../user/model/user.entity';
import { GameLicense } from './game.license.entity';
import { GameProduct } from './game.product.entity';

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

	@ManyToOne(() => GameProduct, { deleteRule: 'restrict' })
	product!: GameProduct;

	@ManyToOne(() => GameLicense, { deleteRule: 'restrict' })
	license!: GameLicense;

	@Property({ type: 'string' })
	mechanism!: GameAcquisitionMechanism;

	@Embedded(() => Money, { prefix: 'price_' })
	price!: Money;

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

}
