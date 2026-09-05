import { Injectable } from '@nestjs/common';
import type { Request } from 'express';

import type { IdentityInputFactory as IdentityInputFactoryContract } from '../../../../infrastructure/auth/contract/auth.identity.contract';
import type { UserIdentityInput } from './user.identity.provider';

@Injectable()
export class UserIdentityInputFactory implements IdentityInputFactoryContract<Request, UserIdentityInput> {

	create(request: Request): UserIdentityInput {
		const body = request.body as Record<string, unknown> | undefined;

		return {
			email: this.getEmail(body),
			password: this.getPassword(body),
		};
	}

	private getEmail(body?: Record<string, unknown>): string {
		if (typeof body?.email !== 'string') {
			return '';
		}

		return body.email.trim().toLowerCase();
	}

	private getPassword(body?: Record<string, unknown>): string {
		if (typeof body?.password !== 'string') {
			return '';
		}

		return body.password;
	}

}
