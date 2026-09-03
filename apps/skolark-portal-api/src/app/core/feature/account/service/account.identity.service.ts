import { Injectable } from '@nestjs/common';

import { User } from '../../user/model/user.entity';
import { AccountIdentity } from '../model/account.identity.entity';
import { AccountIdentityRepository } from '../repository/account.identity.repository';

@Injectable()
export class AccountIdentityService {

	constructor(
		private readonly accountIdentityRepository: AccountIdentityRepository,
	) {
	}

	findLocalByEmail(email: string): Promise<AccountIdentity | null> {
		return this.accountIdentityRepository.findLocalByEmail(email);
	}

	findLocalByUser(user: User): Promise<AccountIdentity | null> {
		return this.accountIdentityRepository.findLocalByUser(user);
	}

	saveIdentity(identity: AccountIdentity): Promise<AccountIdentity> {
		return this.accountIdentityRepository.save(identity);
	}

	async updateLastLogin(identity: AccountIdentity): Promise<AccountIdentity> {
		identity.lastLoginAt = new Date();

		return this.saveIdentity(identity);
	}

}
