import { Injectable } from '@nestjs/common';

import type { IdentityInputFactory as IdentityInputFactoryContract } from '../../../../infrastructure/auth/contract/auth.identity.contract';
import { AccountIdentityProvider } from '../../model/account.identity.entity';
import type { ExternalIdentityInput } from './external.identity-input.model';

@Injectable()
export class MicrosoftIdentityInputFactory implements IdentityInputFactoryContract<ExternalIdentityInput<AccountIdentityProvider.MICROSOFT>, ExternalIdentityInput<AccountIdentityProvider.MICROSOFT>> {

	create(source: ExternalIdentityInput<AccountIdentityProvider.MICROSOFT>): ExternalIdentityInput<AccountIdentityProvider.MICROSOFT> {
		return { ...source, provider: AccountIdentityProvider.MICROSOFT };
	}

}