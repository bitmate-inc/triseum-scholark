import { Collection } from '@mikro-orm/core';
import {
	Entity,
	ManyToMany,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

import type { Media } from '../../media/model/media';
import { EducationCatalogStatus } from './education.catalog.status';
import { Instructor } from './instructor.entity';

@Entity({ tableName: 'institution' })
export class Institution {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@Property()
	name!: string;

	@Property({ unique: true })
	slug!: string;

	@Property({ nullable: true, type: 'json' })
	cover?: Media;

	@Property({ nullable: true, type: 'text' })
	summary?: string;

	@Property({ nullable: true, type: 'text' })
	description?: string;

	@Property({ nullable: true })
	websiteUrl?: string;

	@Property({ default: EducationCatalogStatus.ACTIVE, type: 'string' })
	status: EducationCatalogStatus = EducationCatalogStatus.ACTIVE;

	@ManyToMany({ entity: () => Instructor, owner: true })
	instructorList = new Collection<Instructor>(this);

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

	@Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
	updatedAt?: Date;

}