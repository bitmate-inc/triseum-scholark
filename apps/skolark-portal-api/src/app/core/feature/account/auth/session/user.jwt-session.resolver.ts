import { Inject, Injectable } from '@nestjs/common';

import type {
	SessionBuilder as SessionBuilderContract,
	SessionResolver as SessionResolverContract
} from '../../../../infrastructure/auth/contract/auth.session.contract';
import { SessionBuilder } from '../../../../infrastructure/auth/di/auth.token';
import type { AuthSessionData } from '../../../../infrastructure/auth/model/auth.session.model';
import type { JwtSessionPayload } from '../../../../infrastructure/auth/transport/jwt/model/jwt-session-payload.model';
import { UserEntityRepository } from '../../../user/repository/user.entity.repository';

@Injectable()
export class UserJwtSessionResolver implements SessionResolverContract<JwtSessionPayload, AuthSessionData> {

	constructor(
		private readonly userRepository: UserEntityRepository,
		@Inject(SessionBuilder()) private readonly sessionBuilder: SessionBuilderContract<unknown, AuthSessionData>,
	) {}

	async resolve(payload: JwtSessionPayload): Promise<AuthSessionData | undefined> {
		const userId = await this.userRepository.findActiveId(payload.id);
		return userId ? this.sessionBuilder.build({ id: userId }) : undefined;
	}

}