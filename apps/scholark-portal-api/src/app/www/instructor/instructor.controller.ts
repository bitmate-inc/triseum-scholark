import {
	Controller,
	Get,
	NotFoundException,
	Param,
	ParseUUIDPipe,
	UseGuards,
} from '@nestjs/common';
import {
	ApiCookieAuth,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiTags,
} from '@nestjs/swagger';

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

}