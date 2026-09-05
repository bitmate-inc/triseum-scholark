import {
	CanActivate,
	ExecutionContext,
	HttpException,
	mixin,
	Type
} from '@nestjs/common';
import { AuthGuard, IAuthGuard } from '@nestjs/passport';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';

const guardCache = new Map<string, Type<IAuthGuard>>();

export function WsAuthGuard(type?: string | string[]): Type<IAuthGuard> {
	const cacheKey = Array.isArray(type) ? type.join(',') : type ?? 'default';
	const cachedGuard = guardCache.get(cacheKey);
	if (cachedGuard) {
		return cachedGuard;
	}

	const guard = createWsAuthGuard(type) as Type<IAuthGuard>;
	guardCache.set(cacheKey, guard);
	return guard;
}

function createWsAuthGuard(type?: string | string[]): Type<CanActivate> {
	class WsMixinAuthGuard extends AuthGuard(type) {

		getRequest(context: ExecutionContext): unknown {
			return context.switchToWs().getClient<Socket>().handshake;
		}

		handleRequest<AuthenticatedUser>(error: unknown, user: AuthenticatedUser, info: unknown, context: ExecutionContext): AuthenticatedUser {
			try {
				return super.handleRequest(error, user, info, context);
			} catch (caughtError) {
				if (!(caughtError instanceof HttpException)) {
					throw caughtError;
				}
				throw new WsException(caughtError.getResponse());
			}
		}
	
	}

	return mixin(WsMixinAuthGuard);
}