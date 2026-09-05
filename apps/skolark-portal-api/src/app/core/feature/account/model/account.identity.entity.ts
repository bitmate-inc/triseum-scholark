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

	@ManyToOne(() => User, {
		deleteRule: 'cascade',
		eager: true,
		fieldName: 'user_id',
	})
	user!: User;

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

	static createLocalIdentity(data: {
		email: string;
		passwordHash?: string;
		providerData?: Record<string, unknown>;
		user: User;
	}): AccountIdentity {
		const identity = new AccountIdentity();
		identity.user = data.user;
		identity.provider = AccountIdentityProvider.LOCAL;
		identity.providerAccountId = data.email.trim().toLowerCase();
		identity.passwordHash = data.passwordHash;
		identity.providerData = data.providerData;

		return identity;
	}

	setPasswordHash(passwordHash?: string): void {
		this.passwordHash = passwordHash;
	}

	touchLastLogin(lastLoginAt: Date = new Date()): void {
		this.lastLoginAt = lastLoginAt;
	}

}