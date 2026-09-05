import type { AuthSessionData } from '../model/auth.session.model';

export interface SessionBuilder<TIdentity = unknown, TSession = AuthSessionData> {
	build(identity: TIdentity): Promise<TSession> | TSession;
}

export interface SessionSerializer<TSession = AuthSessionData, TSerialized = unknown> {
	serialize(session: TSession): TSerialized;
}

export interface SessionResolver<TSerialized = unknown, TSession = AuthSessionData> {
	resolve(serialized: TSerialized): Promise<TSession | undefined>;
}