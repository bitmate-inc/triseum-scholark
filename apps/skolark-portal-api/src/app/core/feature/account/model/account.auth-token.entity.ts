import { randomBytes } from 'node:crypto';

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

	@ManyToOne(() => User, {
		deleteRule: 'cascade',
		eager: true,
		fieldName: 'user_id',
	})
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

	isExpired(now: Date = new Date()): boolean {
		return this.expiresAt <= now;
	}

	isConsumed(): boolean {
		return !!this.consumedAt;
	}

	isActive(now: Date = new Date()): boolean {
		return !this.isConsumed() && !this.isExpired(now);
	}

	consume(consumedAt: Date = new Date()): void {
		this.consumedAt = consumedAt;
	}
	

	static createTokenValue(): string {
		return randomBytes(32).toString('base64url');
	}

	static create(data: {
		expiresAt: Date;
		type: AccountAuthTokenType;
		user: User;
		valueHash: string;
	}): AccountAuthToken {
		const token = new AccountAuthToken();
		token.expiresAt = data.expiresAt;
		token.type = data.type;
		token.user = data.user;
		token.valueHash = data.valueHash;

		return token;
	}

}