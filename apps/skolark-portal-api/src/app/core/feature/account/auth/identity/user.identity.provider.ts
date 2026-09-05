import { Injectable } from '@nestjs/common';

import { BCryptPasswordEncoder } from '../../../../../../lib/security/encoder/bcrypt.password-encoder';
import type { IdentityProvider as IdentityProviderContract } from '../../../../infrastructure/auth/contract/auth.identity.contract';
import { User } from '../../../user/model/user.entity';
import { AccountIdentityRepository } from '../../repository/account.identity.repository';

export interface UserIdentityInput {
	email: string;
	password: string;
}

@Injectable()
export class UserIdentityProvider implements IdentityProviderContract<UserIdentityInput, User> {

	constructor(
		private readonly accountIdentityRepository: AccountIdentityRepository,
		private readonly passwordEncoder: BCryptPasswordEncoder,
	) {
	}

	async authenticate(input: UserIdentityInput): Promise<User | undefined> {
		const email = input.email.trim().toLowerCase();
		const identity = await this.accountIdentityRepository.findLocalByEmail({ email });

		if (!identity?.passwordHash) {
			return undefined;
		}

		const isEqual = await this.passwordEncoder.isEqual(identity.passwordHash, input.password);

		if (!isEqual) {
			return undefined;
		}

		const { user } = identity;

		if (!user.isActive()) {
			return undefined;
		}

		identity.touchLastLogin();

		await this.accountIdentityRepository.save(identity);

		return user;
	}

}
