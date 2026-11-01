import {
	Body,
	Controller,
	Get,
	NotFoundException,
	Param,
	ParseUUIDPipe,
	Post,
	UseGuards,
} from '@nestjs/common';
import {
	ApiCookieAuth,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiTags,
} from '@nestjs/swagger';

import { CreateClassroomGameGradingRuleCommand } from '../../core/feature/education/command/create.classroom.game.grading.rule.command';
import {
	GetInstructorClassroomListQuery,
	GetInstructorClassroomQuery,
	GetInstructorProfileQuery,
} from '../../core/feature/education/query/get.instructor.portal.query';
import { AuthSession } from '../../core/infrastructure/auth/auth.decorator';
import type { AuthSessionData } from '../../core/infrastructure/auth/model/auth.session.model';
import { SessionAuthGuard } from '../auth/session.auth.guard';
import { InstructorAuthGuard } from './instructor.auth.guard';
import {
	CreateInstructorClassroomGameGradingRuleRequestDto,
	InstructorClassroomGameGradingRuleResponseDto,
	InstructorClassroomListResponseDto,
	InstructorClassroomResponseDto,
	InstructorProfileResponseDto,
} from './instructor.dto';

@ApiTags('Instructor Portal')
@ApiCookieAuth()
@UseGuards(SessionAuthGuard, InstructorAuthGuard)
@Controller('api/v1/instructor/me')
export class InstructorController {

	constructor(
		private readonly getInstructorProfileQuery: GetInstructorProfileQuery,
		private readonly getInstructorClassroomListQuery: GetInstructorClassroomListQuery,
		private readonly getInstructorClassroomQuery: GetInstructorClassroomQuery,
		private readonly createClassroomGameGradingRuleCommand: CreateClassroomGameGradingRuleCommand,
	) {}

	@Get()
	@ApiOkResponse({ type: InstructorProfileResponseDto })
	async getProfile(@AuthSession() session: AuthSessionData): Promise<InstructorProfileResponseDto> {
		const instructor = await this.getInstructorProfileQuery.execute(session.user.id);
		if (!instructor) {
			throw new NotFoundException();
		}

		return InstructorProfileResponseDto.fromEntity(instructor);
	}

	@Get('classrooms')
	@ApiOkResponse({ type: InstructorClassroomListResponseDto })
	async getClassroomList(@AuthSession() session: AuthSessionData): Promise<InstructorClassroomListResponseDto> {
		const classroomList = await this.getInstructorClassroomListQuery.execute(session.user.id);
		return InstructorClassroomListResponseDto.fromEntityList(classroomList);
	}

	@Get('classrooms/:classroomId')
	@ApiOkResponse({ type: InstructorClassroomResponseDto })
	@ApiNotFoundResponse({ description: 'Classroom not found' })
	async getClassroom(
		@AuthSession() session: AuthSessionData,
		@Param('classroomId', ParseUUIDPipe) classroomId: string,
	): Promise<InstructorClassroomResponseDto> {
		const result = await this.getInstructorClassroomQuery.execute(session.user.id, classroomId);
		if (!result) {
			throw new NotFoundException();
		}

		return InstructorClassroomResponseDto.fromQueryResult(result);
	}

	@Post('classrooms/:classroomId/game-listings/:classroomGameListingId/grading-rules')
	@ApiCreatedResponse({ type: InstructorClassroomGameGradingRuleResponseDto })
	async createClassroomGameGradingRule(
		@AuthSession() session: AuthSessionData,
		@Param('classroomId', ParseUUIDPipe) classroomId: string,
		@Param('classroomGameListingId', ParseUUIDPipe) classroomGameListingId: string,
		@Body() body: CreateInstructorClassroomGameGradingRuleRequestDto,
	): Promise<InstructorClassroomGameGradingRuleResponseDto> {
		const gradingRule = await this.createClassroomGameGradingRuleCommand.execute({
			classroomGameListingId,
			classroomId,
			config: body,
			userId: session.user.id,
		});

		return InstructorClassroomGameGradingRuleResponseDto.fromEntity(gradingRule);
	}

}