import { ExecutionContext, ForbiddenException } from '@nestjs/common';

import { GetPublisherRevenueReportQuery } from '../../core/feature/publisher/query/get.publisher.revenue.report.query';
import { REQUEST_AUTH_PROPERTY } from '../../core/infrastructure/auth/auth.constant';
import { PublisherAuthGuard } from './publisher.auth.guard';

describe(PublisherAuthGuard.name, () => {
	const hasAccess = jest.fn<Promise<boolean>, [string]>();
	const query = { hasAccess } as unknown as GetPublisherRevenueReportQuery;
	const guard = new PublisherAuthGuard(query);

	beforeEach(() => {
		jest.clearAllMocks();
	});

	function createContext(userId?: string): ExecutionContext {
		const request = {
			[REQUEST_AUTH_PROPERTY]: userId ? { user: { id: userId } } : undefined,
		};

		return {
			switchToHttp: () => ({ getRequest: () => request }),
		} as unknown as ExecutionContext;
	}

	it('allows a user linked to a publisher', async () => {
		hasAccess.mockResolvedValue(true);

		await expect(guard.canActivate(createContext('user-id'))).resolves.toBe(true);
		expect(hasAccess).toHaveBeenCalledWith('user-id');
	});

	it('rejects a user without publisher membership', async () => {
		hasAccess.mockResolvedValue(false);

		await expect(guard.canActivate(createContext('user-id'))).rejects.toThrow(ForbiddenException);
	});

	it('rejects requests without a session', async () => {
		await expect(guard.canActivate(createContext())).rejects.toThrow(ForbiddenException);
		expect(hasAccess).not.toHaveBeenCalled();
	});
});