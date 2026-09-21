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
import { InstitutionContract } from './institution.contract.entity';

@Entity({ tableName: 'institution_contract_game_offer' })
@Unique({ properties: ['contract', 'gameVariant'] })
export class InstitutionContractGameOffer {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => InstitutionContract, { deleteRule: 'cascade' })
	contract!: InstitutionContract;

	@ManyToOne(() => GameVariant, { deleteRule: 'restrict' })
	gameVariant!: GameVariant;

	@Embedded(() => Money, { prefix: 'price_' })
	price!: Money;

	@Property({ nullable: true })
	allocatedLicenseQuantity?: number;

	@Property()
	licenseDurationDays!: number;

}