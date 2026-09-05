import type { Request } from 'express';

import { REQUEST_AUTH_PROPERTY } from '../auth.constant';
import type { AuthSessionData } from '../model/auth.session.model';

export function getRequestAuth(request: Request): AuthSessionData | undefined {
	return (request as Request & { [REQUEST_AUTH_PROPERTY]?: AuthSessionData })[REQUEST_AUTH_PROPERTY];
}