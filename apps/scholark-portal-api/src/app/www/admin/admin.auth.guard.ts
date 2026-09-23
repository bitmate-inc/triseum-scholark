import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

import { AdminUserRepository } from '../../core/feature/admin/repository/admin.user.repository';
import { getRequestAuth } from '../../core/infrastructure/auth/util/request';

@Injectable()
export class AdminAuthGuard implements CanActivate {

	constructor(private readonly adminUserRepository: AdminUserRepository) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const session = getRequestAuth(request);
		if (!session?.user.id) {
			throw new ForbiddenException();
		}

		const isAdmin = await this.adminUserRepository.existsByUserId(session.user.id);
		if (!isAdmin) {
			throw new ForbiddenException();
		}

		return true;
	}

}