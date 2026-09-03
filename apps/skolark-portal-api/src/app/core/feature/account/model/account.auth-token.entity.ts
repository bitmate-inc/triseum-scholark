import {
	Entity,
	Enum,
	ManyToOne,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

import { User } from '../../user/model/user.entity';

export enum AccountAuthTokenType {
	EMAIL_VERIFICATION = 'email_verification',
	PASSWORD_RESET = 'password_reset',
}

@Entity({ tableName: 'account_auth_token' })
export class AccountAuthToken {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => User, { deleteRule: 'cascade' })
	user!: User;

	@Enum(() => AccountAuthTokenType)
	type!: AccountAuthTokenType;

	@Property({ hidden: true, unique: true })
	valueHash!: string;

	@Property()
	expiresAt!: Date;

	@Property({ nullable: true })
	consumedAt?: Date;

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

	isActive(now: Date = new Date()): boolean {
		return !this.consumedAt && this.expiresAt > now;
	}

}