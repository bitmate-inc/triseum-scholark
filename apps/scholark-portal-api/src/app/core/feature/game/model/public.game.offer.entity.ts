import {
	Embedded,
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
	Unique,
} from '@mikro-orm/decorators/legacy';

import { Money } from '../../../shared/commerce/model/money.entity';
import { GameVariant } from './game.variant.entity';

@Entity({ tableName: 'public_game_offer' })
@Unique({ properties: ['gameVariant'] })
export class PublicGameOffer {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => GameVariant, { deleteRule: 'restrict' })
	gameVariant!: GameVariant;

	@Embedded(() => Money, { prefix: 'price_' })
	price!: Money;

	@Property({ default: true })
	isAvailable = true;

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

	@Property({ nullable: true })
	publishedAt?: Date;

	isPublished(referenceDate: Date = new Date()): boolean {
		return this.publishedAt != null && this.publishedAt <= referenceDate;
	}

}
