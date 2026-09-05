import { MikroORM, RequestContext } from '@mikro-orm/core';
import { Inject, Injectable } from '@nestjs/common';

import type {
	SessionBuilder as SessionBuilderContract,
	SessionResolver as SessionResolverContract,
} from '../../../../infrastructure/auth/contract/auth.session.contract';
import { SessionBuilder } from '../../../../infrastructure/auth/di/auth.token';
import type { AuthSessionData } from '../../../../infrastructure/auth/model/auth.session.model';
import { UserEntityRepository } from '../../../user/repository/user.entity.repository';

@Injectable()
export class UserExpressSessionResolver implements SessionResolverContract<string, AuthSessionData> {

	constructor(
		private readonly orm: MikroORM,
		private readonly userRepository: UserEntityRepository,
		@Inject(SessionBuilder())
		private readonly sessionBuilder: SessionBuilderContract<unknown, AuthSessionData>,
	) {}

	async resolve(userId: string): Promise<AuthSessionData | undefined> {
		const activeUserId = await RequestContext.create(
			this.orm.em,
			() => this.userRepository.findActiveId(userId),
		);

		return activeUserId ? this.sessionBuilder.build({ id: activeUserId }) : undefined;
	}

}