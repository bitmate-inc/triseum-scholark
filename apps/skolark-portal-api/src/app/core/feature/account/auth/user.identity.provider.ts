import { ForbiddenException, Injectable } from '@nestjs/common';

import { BCryptPasswordEncoder } from '../../../../../lib/security/encoder/bcrypt.password-encoder';
import type { IdentityProvider as IdentityProviderContract } from '../../../infrastructure/auth/contract/auth.identity.contract';
import { User, UserStatus } from '../../user/model/user.entity';
import { AccountIdentityService } from '../service/account.identity.service';

export interface UserIdentityInput {
	email: string;
	password: string;
}

@Injectable()
export class UserIdentityProvider implements IdentityProviderContract<UserIdentityInput, User> {

	constructor(
		private readonly accountIdentityService: AccountIdentityService,
		private readonly passwordEncoder: BCryptPasswordEncoder,
	) {
	}

	async authenticate(input: UserIdentityInput): Promise<User | undefined> {
		const email = input.email.trim().toLowerCase();
		const identity = await this.accountIdentityService.findLocalByEmail(email);

		if (!identity?.passwordHash) {
			return undefined;
		}

		const isEqual = await this.passwordEncoder.isEqual(identity.passwordHash, input.password);
		if (!isEqual) {
			return undefined;
		}
		if (identity.user.status !== UserStatus.ACTIVE) {
			throw new ForbiddenException('Email address has not been confirmed');
		}

		await this.accountIdentityService.updateLastLogin(identity);

		return identity.user;
	}

}
