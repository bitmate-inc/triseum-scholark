import {
	Controller,
	Get,
	UseGuards,
} from '@nestjs/common';
import {
	ApiCookieAuth,
	ApiForbiddenResponse,
	ApiOkResponse,
	ApiTags,
} from '@nestjs/swagger';

import { GetPublisherRevenueReportQuery } from '../../core/feature/publisher/query/get.publisher.revenue.report.query';
import { AuthSession } from '../../core/infrastructure/auth/auth.decorator';
import type { AuthSessionData } from '../../core/infrastructure/auth/model/auth.session.model';
import { SessionAuthGuard } from '../auth/session.auth.guard';
import { PublisherAuthGuard } from './publisher.auth.guard';
import { PublisherRevenueReportResponseDto } from './publisher.dto';

@ApiTags('Publisher Portal')
@ApiCookieAuth()
@ApiForbiddenResponse({ description: 'A publisher account is required' })
@UseGuards(SessionAuthGuard, PublisherAuthGuard)
@Controller('api/v1/publisher/me')
export class PublisherController {

	constructor(private readonly getPublisherRevenueReportQuery: GetPublisherRevenueReportQuery) {}

	@Get('revenue')
	@ApiOkResponse({ type: PublisherRevenueReportResponseDto })
	async getRevenue(@AuthSession() session: AuthSessionData): Promise<PublisherRevenueReportResponseDto> {
		const result = await this.getPublisherRevenueReportQuery.execute(session.user.id);
		return PublisherRevenueReportResponseDto.fromQueryResult(result);
	}

}