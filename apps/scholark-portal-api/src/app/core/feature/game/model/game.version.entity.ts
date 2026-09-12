import {
	Embedded,
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
	Unique,
} from '@mikro-orm/decorators/legacy';

import { Money } from '../../../shared/commerce/model/money.entity';
import { Game } from './game.entity';

@Entity({ tableName: 'game_version' })
@Unique({ properties: ['game', 'publisherVersion'] })
export class GameVersion {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => Game, { deleteRule: 'cascade' })
	game!: Game;

	@Property()
	publisherVersion!: string;

	@Property()
	runUrl!: string;

	@Embedded(() => Money, { prefix: 'price_' })
	price!: Money;

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

	@Property({ nullable: true })
	publishedAt?: Date;

}
