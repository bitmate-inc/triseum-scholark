import { Injectable } from '@nestjs/common';

import type { IdentityInputFactory as IdentityInputFactoryContract } from '../../../../infrastructure/auth/contract/auth.identity.contract';
import { AccountIdentityProvider } from '../../model/account.identity.entity';
import type { ExternalIdentityInput } from './external.identity-input.model';

@Injectable()
export class GoogleIdentityInputFactory implements IdentityInputFactoryContract<ExternalIdentityInput<AccountIdentityProvider.GOOGLE>, ExternalIdentityInput<AccountIdentityProvider.GOOGLE>> {

	create(source: ExternalIdentityInput<AccountIdentityProvider.GOOGLE>): ExternalIdentityInput<AccountIdentityProvider.GOOGLE> {
		return { ...source, provider: AccountIdentityProvider.GOOGLE };
	}

}