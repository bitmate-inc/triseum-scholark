import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { AuthSessionData } from './model/auth.session.model';
import { getRequestAuth } from './util/request';

export const AuthSession = createParamDecorator(
	(_data: unknown, context: ExecutionContext): AuthSessionData | undefined => {
		const request = context.switchToHttp().getRequest();
		return getRequestAuth(request);
	},
);