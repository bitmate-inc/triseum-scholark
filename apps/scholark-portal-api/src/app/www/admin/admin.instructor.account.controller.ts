import {
	Body,
	Controller,
	NotFoundException,
	Param,
	ParseUUIDPipe,
	Post,
	UseGuards,
} from '@nestjs/common';
import {
	ApiCookieAuth,
	ApiCreatedResponse,
	ApiTags,
} from '@nestjs/swagger';

import { LinkAdminInstructorAccountCommand } from '../../core/feature/admin/command/link.admin.instructor.account.command';
import { GetAdminInstructorQuery } from '../../core/feature/admin/query/get.admin.instructor.query';
import { CreateInstructorInvitationCommand } from '../../core/feature/education/command/create.instructor.invitation.command';
import { AuthSession } from '../../core/infrastructure/auth/auth.decorator';
import type { AuthSessionData } from '../../core/infrastructure/auth/model/auth.session.model';
import { SessionAuthGuard } from '../auth/session.auth.guard';
import { AdminAuthGuard } from './admin.auth.guard';
import { CreateAdminInstructorInvitationResponseDto, LinkAdminInstructorAccountRequestDto } from './admin.instructor.account.dto';
import { GetAdminInstructorResponseDto } from './admin.instructor.dto';

@ApiTags('Admin Instructors')
@ApiCookieAuth()
@UseGuards(SessionAuthGuard, AdminAuthGuard)
@Controller('api/v1/admin/instructors/:instructorId/account')
export class AdminInstructorAccountController {

	constructor(
		private readonly linkAdminInstructorAccountCommand: LinkAdminInstructorAccountCommand,
		private readonly createInstructorInvitationCommand: CreateInstructorInvitationCommand,
		private readonly getAdminInstructorQuery: GetAdminInstructorQuery,
	) {}

	@Post('invitation')
	@ApiCreatedResponse({ type: CreateAdminInstructorInvitationResponseDto })
	async createInvitation(
		@Param('instructorId', ParseUUIDPipe) instructorId: string,
		@Body() body: LinkAdminInstructorAccountRequestDto,
		@AuthSession() session: AuthSessionData,
	): Promise<CreateAdminInstructorInvitationResponseDto> {
		const result = await this.createInstructorInvitationCommand.execute({
			email: body.email,
			instructorId,
			invitedByUserId: session.user.id,
		});

		return {
			expiresAt: result.expiresAt,
			invitationUrl: result.invitationUrl,
			message: `Invitation sent to ${result.email}.`,
		};
	}

	@Post()
	@ApiCreatedResponse({ type: GetAdminInstructorResponseDto })
	async linkAccount(
		@Param('instructorId', ParseUUIDPipe) instructorId: string,
		@Body() body: LinkAdminInstructorAccountRequestDto,
	): Promise<GetAdminInstructorResponseDto> {
		await this.linkAdminInstructorAccountCommand.execute(instructorId, body.email);

		const result = await this.getAdminInstructorQuery.execute({ filterBy: { id: instructorId } });
		if (!result.instructor) {
			throw new NotFoundException('Instructor not found.');
		}

		return GetAdminInstructorResponseDto.fromQueryResult({
			classroomList: result.classroomList,
			instructor: result.instructor,
			instructorUser: result.instructorUser,
			institutionList: result.institutionList,
		});
	}

}