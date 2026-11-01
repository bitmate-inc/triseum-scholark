import { Module } from '@nestjs/common';

import { LinkAdminPublisherMemberCommand } from '../../core/feature/admin/command/link.admin.publisher.member.command';
import { AdminAuthGuard } from './admin.auth.guard';
import { AdminController } from './admin.controller';
import { AdminInstructorAccountController } from './admin.instructor.account.controller';
import { AdminPublisherMemberController } from './admin.publisher.member.controller';

@Module({
	controllers: [AdminController, AdminInstructorAccountController, AdminPublisherMemberController],
	providers: [AdminAuthGuard, LinkAdminPublisherMemberCommand],
})
export class AdminModule {}