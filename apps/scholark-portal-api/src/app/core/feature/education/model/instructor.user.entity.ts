import {
	Entity,
	OneToOne,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

import { User } from '../../user/model/user.entity';
import { Instructor } from './instructor.entity';

@Entity({ tableName: 'instructor_user' })
export class InstructorUser {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@OneToOne({ entity: () => User, owner: true, unique: true })
	user!: User;

	@OneToOne({ entity: () => Instructor, owner: true, unique: true })
	instructor!: Instructor;

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

}