import { Collection } from '@mikro-orm/core';
import {
	Entity,
	OneToMany,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

import { GameTaxonomyTerm } from './game.taxonomy.term.entity';

export interface GameMedia {
	type: 'image' | 'video';
	src: string;
	alt: string;
}

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
	cover?: GameMedia;

	@OneToMany(() => GameTaxonomyTerm, (gameTaxonomyTerm) => gameTaxonomyTerm.gameId)
	taxonomyList = new Collection<GameTaxonomyTerm>(this);

	@Property({ nullable: true })
	estimatedLengthMinutesMin?: number;

	@Property({ nullable: true })
	estimatedLengthMinutesMax?: number;

	@Property({ nullable: true })
	isFeatured?: boolean;

	@Property({ nullable: true, type: 'json' })
	mediaList?: GameMedia[];

	@Property({ nullable: true })
	publishedAt?: Date;

}