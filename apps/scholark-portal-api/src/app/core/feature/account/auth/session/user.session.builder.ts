import { Injectable } from '@nestjs/common';

import type { SessionBuilder as SessionBuilderContract } from '../../../../infrastructure/auth/contract/auth.session.contract';
import { AuthSessionData } from '../../../../infrastructure/auth/model/auth.session.model';

@Injectable()
export class UserSessionBuilder implements SessionBuilderContract<{ id?: string }, AuthSessionData> {

	build(user: { id?: string }): AuthSessionData {
		if (!user.id) {
			throw new Error('Cannot build an authenticated session without a user ID');
		}

		return AuthSessionData.create({ user: { id: user.id } });
	}

}