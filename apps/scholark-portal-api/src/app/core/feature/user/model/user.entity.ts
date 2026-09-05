import {
	Entity,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

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

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

	@Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
	updatedAt?: Date;

	setEmail(email: string): void {
		this.email = email.trim().toLowerCase();
	}

	isActive(): boolean {
		return this.status === UserStatus.ACTIVE;
	}

}