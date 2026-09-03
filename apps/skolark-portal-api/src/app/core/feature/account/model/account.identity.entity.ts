import type { Rel } from '@mikro-orm/core';
import {
	Entity,
	Index,
	ManyToOne,
	PrimaryKey,
	Property,
	Unique,
} from '@mikro-orm/decorators/legacy';

import { User } from '../../user/model/user.entity';

export enum AccountIdentityProvider {
	LOCAL = 'local',
	GOOGLE = 'google',
	MICROSOFT = 'microsoft',
}

@Entity({ tableName: 'account_identity' })
@Unique({ properties: ['provider', 'providerAccountId'] })
@Unique({ properties: ['user', 'provider'] })
@Index({ properties: ['user'] })
export class AccountIdentity {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => User, { deleteRule: 'cascade' })
	user!: Rel<User>;

	@Property({ type: 'string' })
	provider!: AccountIdentityProvider;

	@Property()
	providerAccountId!: string;

	@Property({ hidden: true, nullable: true })
	passwordHash?: string;

	@Property({ nullable: true, type: 'json' })
	providerData?: Record<string, unknown>;

	@Property({ nullable: true })
	lastLoginAt?: Date;

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

	@Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
	updatedAt?: Date;

	static createLocal(user: User, email: string, passwordHash: string): AccountIdentity {
		const identity = new AccountIdentity();
		identity.user = user;
		identity.provider = AccountIdentityProvider.LOCAL;
		identity.providerAccountId = email.trim().toLowerCase();
		identity.passwordHash = passwordHash;

		return identity;
	}

}