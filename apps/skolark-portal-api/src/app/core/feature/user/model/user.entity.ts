import { Collection } from '@mikro-orm/core';
import {
	Entity,
	OneToMany,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

import { AccountIdentity } from '../../account/model/account.identity.entity';

export enum UserStatus {
	PENDING = 'pending',
	ACTIVE = 'active',
}

@Entity({ tableName: 'user_account' })
export class User {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@Property({ unique: true })
	email!: string;

	@Property({ nullable: true })
	firstName?: string;

	@Property({ nullable: true })
	lastName?: string;

	@Property({ default: UserStatus.PENDING, type: 'string' })
	status: UserStatus = UserStatus.PENDING;

	@OneToMany(() => AccountIdentity, (identity) => identity.user)
	identityList = new Collection<AccountIdentity>(this);

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

	@Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
	updatedAt?: Date;

	setEmail(email: string): void {
		this.email = email.trim().toLowerCase();
	}

}