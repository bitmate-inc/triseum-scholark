import {
	Entity,
	OneToOne,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

import { User } from '../../user/model/user.entity';

@Entity({ tableName: 'admin_user' })
export class AdminUser {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@OneToOne({ entity: () => User, owner: true, unique: true })
	user!: User;

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

}