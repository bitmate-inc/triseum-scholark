import {
	Embedded,
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
	Unique,
} from '@mikro-orm/decorators/legacy';

import { Money } from '../../../shared/commerce/model/money.entity';
import { GameVersion } from '../../game/model/game.version.entity';
import { InstitutionContract } from './institution.contract.entity';

@Entity({ tableName: 'institution_contract_game_version' })
@Unique({ properties: ['contract', 'gameVersion'] })
export class InstitutionContractGameVersion {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => InstitutionContract, { deleteRule: 'cascade' })
	contract!: InstitutionContract;

	@ManyToOne(() => GameVersion, { deleteRule: 'cascade' })
	gameVersion!: GameVersion;

	@Embedded(() => Money, { prefix: 'price_' })
	price!: Money;

	@Property()
	licenseDurationDays!: number;

}