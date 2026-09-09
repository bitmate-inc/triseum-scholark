import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Unique,
} from '@mikro-orm/decorators/legacy';

import { Game } from '../../game/model/game.entity';
import { InstitutionContract } from './institution.contract.entity';

@Entity({ tableName: 'contract_game' })
@Unique({ properties: ['contract', 'game'] })
export class ContractGame {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => InstitutionContract, { deleteRule: 'cascade' })
	contract!: InstitutionContract;

	@ManyToOne(() => Game, { deleteRule: 'cascade' })
	game!: Game;

}
