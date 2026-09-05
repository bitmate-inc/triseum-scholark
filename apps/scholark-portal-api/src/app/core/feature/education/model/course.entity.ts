import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
	Unique,
} from '@mikro-orm/decorators/legacy';

import type { Media } from '../../media/model/media';
import { EducationCatalogStatus } from './education.catalog.status';
import { EducationalInstitution } from './educational.institution.entity';

@Entity({ tableName: 'course' })
@Unique({ properties: ['institution', 'code'] })
export class Course {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => EducationalInstitution, { deleteRule: 'cascade' })
	institution!: EducationalInstitution;

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

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

	@Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
	updatedAt?: Date;

}