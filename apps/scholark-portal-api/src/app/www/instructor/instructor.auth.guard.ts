import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

import { InstructorUserRepository } from '../../core/feature/education/repository/instructor.user.repository';
import { getRequestAuth } from '../../core/infrastructure/auth/util/request';

@Injectable()
export class InstructorAuthGuard implements CanActivate {

	constructor(private readonly instructorUserRepository: InstructorUserRepository) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const session = getRequestAuth(request);
		if (!session?.user.id) {
			throw new ForbiddenException();
		}

		const isInstructor = await this.instructorUserRepository.existsByUserId(session.user.id);
		if (!isInstructor) {
			throw new ForbiddenException();
		}

		return true;
	}

}