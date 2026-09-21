import {
	Entity,
	ManyToOne,
	PrimaryKey,
} from '@mikro-orm/decorators/legacy';

import { User } from '../../user/model/user.entity';
import { Publisher } from './publisher.entity';

@Entity({ tableName: 'publisher_member' })
export class PublisherMember {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => Publisher, { deleteRule: 'cascade' })
	publisher!: Publisher;

	@ManyToOne(() => User, { deleteRule: 'cascade' })
	user!: User;

}
