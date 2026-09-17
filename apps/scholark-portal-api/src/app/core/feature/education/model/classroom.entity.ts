import { Collection } from '@mikro-orm/core';
import {
	Entity,
	ManyToMany,
	ManyToOne,
	PrimaryKey,
	Property,
	Unique,
} from '@mikro-orm/decorators/legacy';

import type { Media } from '../../media/model/media';
import { TaxonomyTerm } from '../../taxonomy/model/taxonomy.term.entity';
import { Course } from './course.entity';
import { EducationCatalogStatus } from './education.catalog.status';
import { Institution } from './institution.entity';
import { Instructor } from './instructor.entity';

@Entity({ tableName: 'classroom' })
@Unique({ properties: ['institution', 'code'] })
export class Classroom {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => Institution, { deleteRule: 'cascade' })
	institution!: Institution;

	@Property()
	name!: string;

	@Property()
	code!: string;

	@Property({ unique: true })
	slug!: string;

	@Property({ nullable: true, type: 'json' })
	cover?: Media;

	@Property({ nullable: true, type: 'text' })
	summary?: string;

	@Property({ nullable: true, type: 'text' })
	description?: string;

	@Property({ default: EducationCatalogStatus.ACTIVE, type: 'string' })
	status: EducationCatalogStatus = EducationCatalogStatus.ACTIVE;

	@ManyToMany({ entity: () => Course, owner: true })
	courseList = new Collection<Course>(this);

	@ManyToMany({ entity: () => Instructor, owner: true })
	instructorList = new Collection<Instructor>(this);

	@ManyToMany({ entity: () => TaxonomyTerm, owner: true })
	taxonomyTermList = new Collection<TaxonomyTerm>(this);

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

	@Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
	updatedAt?: Date;

}