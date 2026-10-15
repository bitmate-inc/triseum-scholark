import { Module } from '@nestjs/common';

import { SessionAuthGuard } from '../auth/session.auth.guard';
import { InstructorAuthGuard } from './instructor.auth.guard';
import { InstructorController } from './instructor.controller';
import { InstructorInvitationController } from './instructor.invitation.controller';

@Module({
	controllers: [InstructorController, InstructorInvitationController],
	providers: [InstructorAuthGuard, SessionAuthGuard],
})
export class InstructorModule {}