import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
	Unique,
} from '@mikro-orm/decorators/legacy';

import { TaxonomyTerm } from '../../taxonomy/model/taxonomy.term.entity';
import { Game } from './game.entity';

@Entity({ tableName: 'game_taxonomy_term' })
@Unique({ properties: ['gameId', 'taxonomyTerm'] })
export class GameTaxonomyTerm {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => Game, {
		deleteRule: 'cascade',
		fieldName: 'game_id',
		mapToPk: true,
	})
	gameId!: string;

	@ManyToOne(() => TaxonomyTerm, { deleteRule: 'cascade' })
	taxonomyTerm!: TaxonomyTerm;

	@Property({ default: false })
	isPrimary = false;

	@Property({ default: 0 })
	sortOrder = 0;

}