import { Collection } from '@mikro-orm/core';
import {
	Entity,
	ManyToMany,
	OneToMany,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

import type { Media } from '../../media/model/media';
import { Publisher } from '../../publisher/model/publisher.entity';
import { GameTaxonomyTerm } from './game.taxonomy.term.entity';

@Entity({ tableName: 'game' })
export class Game {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@Property()
	title!: string;

	@Property({ unique: true })
	slug!: string;

	@Property({ nullable: true, type: 'text' })
	summary?: string;

	@Property({ nullable: true, type: 'text' })
	description?: string;

	@Property({ nullable: true, type: 'json' })
	cover?: Media;

	@ManyToMany({ entity: () => Publisher, owner: true })
	publisherList = new Collection<Publisher>(this);

	@OneToMany(() => GameTaxonomyTerm, (gameTaxonomyTerm) => gameTaxonomyTerm.gameId)
	taxonomyList = new Collection<GameTaxonomyTerm>(this);

	@Property({ nullable: true })
	estimatedLengthMinutesMin?: number;

	@Property({ nullable: true })
	estimatedLengthMinutesMax?: number;

	@Property({ nullable: true })
	isFeatured?: boolean;

	@Property({ nullable: true, type: 'json' })
	mediaList?: Media[];

	@Property({ nullable: true })
	publishedAt?: Date;

}