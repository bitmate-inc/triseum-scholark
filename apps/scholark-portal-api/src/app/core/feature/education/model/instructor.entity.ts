import {
	Entity,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

@Entity({ tableName: 'instructor' })
export class Instructor {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@Property()
	name!: string;

	@Property({ unique: true })
	slug!: string;

}