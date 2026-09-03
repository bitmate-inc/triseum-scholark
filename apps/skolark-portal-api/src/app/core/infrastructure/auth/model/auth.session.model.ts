import type { AuthUser } from './auth.user.model';

export class AuthSessionData {

	user!: AuthUser;

	static create(data: { user: AuthUser }): AuthSessionData {
		const session = new AuthSessionData();

		session.user = data.user;

		return session;
	}

}
