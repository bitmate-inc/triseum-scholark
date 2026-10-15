import {
	BadRequestException,
	Body,
	Controller,
	Get,
	NotFoundException,
	Post,
	Query,
} from '@nestjs/common';
import {
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger';

import { AcceptInstructorInvitationCommand } from '../../core/feature/education/command/accept.instructor.invitation.command';
import { GetInstructorInvitationQuery } from '../../core/feature/education/query/get.instructor.invitation.query';
import {
	AcceptInstructorInvitationRequestDto,
	AcceptInstructorInvitationResponseDto,
	InstructorInvitationResponseDto,
} from './instructor.invitation.dto';

@ApiTags('Instructor Invitations')
@Controller('api/v1/instructor-invitation')
export class InstructorInvitationController {

	constructor(
		private readonly getInstructorInvitationQuery: GetInstructorInvitationQuery,
		private readonly acceptInstructorInvitationCommand: AcceptInstructorInvitationCommand,
	) {}

	@Get()
	@ApiOperation({ operationId: 'instructorInvitationGetDetails', summary: 'Get the details for an instructor invitation' })
	@ApiQuery({ name: 'token', required: true })
	@ApiOkResponse({ type: InstructorInvitationResponseDto })
	@ApiNotFoundResponse({ description: 'Invitation not found or expired' })
	async getInvitation(@Query('token') token?: string): Promise<InstructorInvitationResponseDto> {
		if (!token) {
			throw new BadRequestException('Invitation token is required.');
		}

		const result = await this.getInstructorInvitationQuery.execute(token);
		if (!result) {
			throw new NotFoundException('This instructor invitation is invalid or expired.');
		}

		return InstructorInvitationResponseDto.fromQueryResult(result);
	}

	@Post('accept')
	@ApiOperation({ operationId: 'instructorInvitationAccept', summary: 'Accept an instructor invitation' })
	@ApiCreatedResponse({ type: AcceptInstructorInvitationResponseDto })
	@ApiNotFoundResponse({ description: 'Invitation not found or expired' })
	async acceptInvitation(
		@Body() body: AcceptInstructorInvitationRequestDto,
	): Promise<AcceptInstructorInvitationResponseDto> {
		const result = await this.acceptInstructorInvitationCommand.execute(body);
		return AcceptInstructorInvitationResponseDto.fromResult(result);
	}

}