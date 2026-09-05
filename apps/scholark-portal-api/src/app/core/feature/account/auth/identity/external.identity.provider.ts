import { Injectable } from '@nestjs/common';

import type { IdentityProvider as IdentityProviderContract } from '../../../../infrastructure/auth/contract/auth.identity.contract';
import { User } from '../../../user/model/user.entity';
import { AccountIdentityProvider } from '../../model/account.identity.entity';
import { AccountIdentityRepository } from '../../repository/account.identity.repository';
import type { ExternalIdentityInput } from './external.identity-input.model';

abstract class ExternalIdentityProviderBase<Provider extends AccountIdentityProvider> implements IdentityProviderContract<ExternalIdentityInput<Provider>, User> {

	protected constructor(
		private readonly provider: Provider,
		private readonly identityRepository: AccountIdentityRepository,
	) {}

	async authenticate(input: ExternalIdentityInput<Provider>): Promise<User | undefined> {
		const identity = await this.identityRepository.findByProviderAndAccountId({
			provider: this.provider,
			providerAccountId: input.providerAccountId,
		});

		if (!identity) {
			return undefined;
		}

		const { user } = identity;
		
		if (!user.isActive()) {
			return undefined;
		}

		if (input.providerData !== undefined) {
			identity.providerData = input.providerData;
		}

		identity.touchLastLogin();

		await this.identityRepository.save(identity);

		return user;
	}

}

@Injectable()
export class GoogleIdentityProvider extends ExternalIdentityProviderBase<AccountIdentityProvider.GOOGLE> {

	constructor(repository: AccountIdentityRepository) {
		super(AccountIdentityProvider.GOOGLE, repository);
	}

}

@Injectable()
export class MicrosoftIdentityProvider extends ExternalIdentityProviderBase<AccountIdentityProvider.MICROSOFT> {

	constructor(repository: AccountIdentityRepository) {
		super(AccountIdentityProvider.MICROSOFT, repository);
	}

}