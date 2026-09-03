import { Injectable } from '@nestjs/common';

import type { SessionSerializer as SessionSerializerContract } from '../../../infrastructure/auth/contract/auth.session.contract';
import type { AuthSessionData } from '../../../infrastructure/auth/model/auth.session.model';
import type { User } from '../../user/model/user.entity';
import { AccountSessionService } from '../service/account.session.service';

@Injectable()
export class UserOpaqueSessionSerializer implements SessionSerializerContract<AuthSessionData, string> {

	constructor(
		private readonly accountSessionService: AccountSessionService,
	) {}

	serialize(session: AuthSessionData): Promise<string> {
		return this.accountSessionService.create(session.user as User);
	}

}
