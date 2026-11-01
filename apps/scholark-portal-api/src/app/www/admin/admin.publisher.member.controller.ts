import {
	Body,
	Controller,
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

import { LinkAdminPublisherMemberCommand } from '../../core/feature/admin/command/link.admin.publisher.member.command';
import { SessionAuthGuard } from '../auth/session.auth.guard';
import { AdminAuthGuard } from './admin.auth.guard';
import { LinkAdminPublisherMemberRequestDto, LinkAdminPublisherMemberResponseDto } from './admin.publisher.member.dto';

@ApiTags('Admin Publishers')
@ApiCookieAuth()
@UseGuards(SessionAuthGuard, AdminAuthGuard)
@Controller('api/v1/admin/publishers/:publisherId/members')
export class AdminPublisherMemberController {

	constructor(private readonly linkAdminPublisherMemberCommand: LinkAdminPublisherMemberCommand) {}

	@Post()
	@ApiCreatedResponse({ type: LinkAdminPublisherMemberResponseDto })
	async linkMember(
		@Param('publisherId', ParseUUIDPipe) publisherId: string,
		@Body() body: LinkAdminPublisherMemberRequestDto,
	): Promise<LinkAdminPublisherMemberResponseDto> {
		const member = await this.linkAdminPublisherMemberCommand.execute(publisherId, body.email);
		return { message: `Account ${member.user.email} linked to publisher.` };
	}

}