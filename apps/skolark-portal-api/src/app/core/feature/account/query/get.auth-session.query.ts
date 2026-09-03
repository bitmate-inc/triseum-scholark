import { Inject, Injectable } from '@nestjs/common';

import { StaticFactory } from '../../../../../lib/factory/static.factory';
import type { SessionResolver as SessionResolverContract } from '../../../infrastructure/auth/contract/auth.session.contract';
import { SessionResolver } from '../../../infrastructure/auth/di/auth.token';
import type { AuthSessionData } from '../../../infrastructure/auth/model/auth.session.model';
import { User } from '../../user/model/user.entity';

export class GetAuthSessionQueryData extends StaticFactory {

	sessionToken?: string;

}

export class GetAuthSessionQueryResult extends StaticFactory {

	user?: User;

}

@Injectable()
export class GetAuthSessionQuery {

	constructor(
		@Inject(SessionResolver('opaque'))
		private readonly sessionResolver: SessionResolverContract<string | undefined, AuthSessionData>,
	) {
	}

	async execute(data: GetAuthSessionQueryData): Promise<GetAuthSessionQueryResult> {
		const session = await this.sessionResolver.resolve(data.sessionToken);

		return GetAuthSessionQueryResult.create({ user: session?.user as User | undefined });
	}

}
