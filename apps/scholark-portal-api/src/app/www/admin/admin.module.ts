import { Module } from '@nestjs/common';

import { AdminAuthGuard } from './admin.auth.guard';
import { AdminController } from './admin.controller';
import { AdminInstructorAccountController } from './admin.instructor.account.controller';

@Module({
	controllers: [AdminController, AdminInstructorAccountController],
	providers: [AdminAuthGuard],
})
export class AdminModule {}