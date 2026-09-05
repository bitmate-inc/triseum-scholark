import { Inject, Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

import type { SessionResolver as SessionResolverContract, SessionSerializer as SessionSerializerContract } from '../../contract/auth.session.contract';
import { SessionResolver, SessionSerializer } from '../../di/auth.token';
import type { AuthSessionData } from '../../model/auth.session.model';

@Injectable()
export class PassportExpressSessionSerializer extends PassportSerializer {

	constructor(
		@Inject(SessionSerializer('express-session'))
		private readonly sessionSerializer: SessionSerializerContract<AuthSessionData, string>,
		@Inject(SessionResolver('express-session'))
		private readonly sessionResolver: SessionResolverContract<string, AuthSessionData>,
	) {
		super();
	}

	serializeUser(session: AuthSessionData, done: (error: Error | null, serialized?: string) => void): void {
		done(null, this.sessionSerializer.serialize(session));
	}

	async deserializeUser(serialized: string, done: (error: Error | null, session?: AuthSessionData | false) => void): Promise<void> {
		const session = await this.sessionResolver.resolve(serialized);
		done(null, session || false);
	}

}