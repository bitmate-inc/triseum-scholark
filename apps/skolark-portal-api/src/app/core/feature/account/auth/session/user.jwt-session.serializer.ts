import { Injectable } from '@nestjs/common';

import type { SessionSerializer as SessionSerializerContract } from '../../../../infrastructure/auth/contract/auth.session.contract';
import type { AuthSessionData } from '../../../../infrastructure/auth/model/auth.session.model';
import type { JwtSessionPayload } from '../../../../infrastructure/auth/transport/jwt/model/jwt-session-payload.model';

@Injectable()
export class UserJwtSessionSerializer implements SessionSerializerContract<AuthSessionData, JwtSessionPayload> {

	serialize(session: AuthSessionData): JwtSessionPayload {
		return { id: session.user.id };
	}

}