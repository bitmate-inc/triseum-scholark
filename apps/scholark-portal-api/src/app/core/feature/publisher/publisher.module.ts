import { Module } from '@nestjs/common';

import { GetPublisherRevenueReportQuery } from './query/get.publisher.revenue.report.query';

@Module({
	exports: [GetPublisherRevenueReportQuery],
	providers: [GetPublisherRevenueReportQuery],
})
export class PublisherFeatureModule {}