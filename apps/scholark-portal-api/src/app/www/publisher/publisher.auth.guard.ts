import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

import { GetPublisherRevenueReportQuery } from '../../core/feature/publisher/query/get.publisher.revenue.report.query';
import { getRequestAuth } from '../../core/infrastructure/auth/util/request';

@Injectable()
export class PublisherAuthGuard implements CanActivate {

	constructor(private readonly getPublisherRevenueReportQuery: GetPublisherRevenueReportQuery) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const session = getRequestAuth(request);
		if (!session?.user.id) {
			throw new ForbiddenException();
		}

		const hasAccess = await this.getPublisherRevenueReportQuery.hasAccess(session.user.id);
		if (!hasAccess) {
			throw new ForbiddenException();
		}

		return true;
	}

}