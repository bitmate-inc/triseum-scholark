import { Injectable } from '@nestjs/common';

import type { SessionSerializer as SessionSerializerContract } from '../../../../infrastructure/auth/contract/auth.session.contract';
import type { AuthSessionData } from '../../../../infrastructure/auth/model/auth.session.model';

@Injectable()
export class UserExpressSessionSerializer implements SessionSerializerContract<AuthSessionData, string> {

	serialize(session: AuthSessionData): string {
		return session.user.id;
	}

}