import { Inject, Injectable } from '@nestjs/common';

import type {
	SessionBuilder as SessionBuilderContract,
	SessionResolver as SessionResolverContract,
} from '../../../infrastructure/auth/contract/auth.session.contract';
import { SessionBuilder } from '../../../infrastructure/auth/di/auth.token';
import { AuthSessionData } from '../../../infrastructure/auth/model/auth.session.model';
import { AccountSessionService } from '../service/account.session.service';

@Injectable()
export class UserOpaqueSessionResolver implements SessionResolverContract<string | undefined, AuthSessionData> {

	constructor(
		private readonly accountSessionService: AccountSessionService,
		@Inject(SessionBuilder())
		private readonly sessionBuilder: SessionBuilderContract<unknown, AuthSessionData>,
	) {}

	async resolve(sessionToken?: string): Promise<AuthSessionData | undefined> {
		const user = await this.accountSessionService.findUser(sessionToken);

		if (!user) {
			return undefined;
		}

		return this.sessionBuilder.build(user);
	}

}
