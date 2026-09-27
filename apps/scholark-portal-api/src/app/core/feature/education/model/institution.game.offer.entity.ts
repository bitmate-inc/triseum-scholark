import {
	Embedded,
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
	Unique,
} from '@mikro-orm/decorators/legacy';

import { Money } from '../../../shared/commerce/model/money.entity';
import { GameVariant } from '../../game/model/game.variant.entity';

export enum InstitutionGameOfferDesignatedPayor {
	STUDENT = 'student',
	INSTITUTION = 'institution',
}

@Entity({ tableName: 'institution_game_offer' })
@Unique({ properties: ['gameVariant', 'designatedPayor'] })
export class InstitutionGameOffer {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => GameVariant, { deleteRule: 'restrict' })
	gameVariant!: GameVariant;

	@Property({ type: 'string' })
	designatedPayor!: InstitutionGameOfferDesignatedPayor;

	@Embedded(() => Money, { prefix: 'price_' })
	price!: Money;

	@Property({ nullable: true })
	allocatedLicenseQuantity?: number;

	@Property()
	licenseDurationDays!: number;

	@Property({ nullable: true })
	publishedAt?: Date;

	isPublished(referenceDate: Date = new Date()): boolean {
		return this.publishedAt != null && this.publishedAt <= referenceDate;
	}

}