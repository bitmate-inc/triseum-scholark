import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
	Unique,
} from '@mikro-orm/decorators/legacy';

import { GameProduct } from '../../game/model/game.product.entity';
import { InstitutionContract } from './institution.contract.entity';

@Entity({ tableName: 'institution_contract_game_product' })
@Unique({ properties: ['contract', 'gameProduct'] })
export class InstitutionContractGameProduct {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => InstitutionContract, { deleteRule: 'cascade' })
	contract!: InstitutionContract;

	@ManyToOne(() => GameProduct, { deleteRule: 'restrict' })
	gameProduct!: GameProduct;

	@Property({ nullable: true })
	allocatedLicenseQuantity?: number;

	@Property()
	licenseDurationDays!: number;

}