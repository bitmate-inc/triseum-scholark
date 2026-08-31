import {
	Entity,
	Enum,
	PrimaryKey,
	Property,
	Unique,
} from '@mikro-orm/decorators/legacy';

export enum TaxonomyType {
	Category = 'category',
	Genre = 'genre',
	Skill = 'skill',
	Subject = 'subject',
	Theme = 'theme',
}

@Entity({ tableName: 'taxonomy_term' })
@Unique({ properties: ['type', 'slug'] })
export class TaxonomyTerm {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@Enum(() => TaxonomyType)
	type!: TaxonomyType;

	@Property()
	label!: string;

	@Property()
	slug!: string;

}