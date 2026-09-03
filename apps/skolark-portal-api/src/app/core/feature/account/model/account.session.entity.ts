import {
	Entity,
	Index,
	ManyToOne,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

import { User } from '../../user/model/user.entity';

@Entity({ tableName: 'account_session' })
@Index({ properties: ['user'] })
export class AccountSession {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => User, { deleteRule: 'cascade' })
	user!: User;

	@Property({ hidden: true, unique: true })
	valueHash!: string;

	@Property()
	expiresAt!: Date;

	@Property({ nullable: true })
	revokedAt?: Date;

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

	@Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
	updatedAt?: Date;

	isActive(now: Date = new Date()): boolean {
		return !this.revokedAt && this.expiresAt > now;
	}

}