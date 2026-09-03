import { Injectable } from '@nestjs/common';

import type { SessionBuilder as SessionBuilderContract } from '../../../infrastructure/auth/contract/auth.session.contract';
import { AuthSessionData } from '../../../infrastructure/auth/model/auth.session.model';
import type { AuthUser } from '../../../infrastructure/auth/model/auth.user.model';

@Injectable()
export class UserSessionBuilder implements SessionBuilderContract<AuthUser, AuthSessionData> {

	build(user: AuthUser): AuthSessionData {
		return AuthSessionData.create({ user });
	}

}
