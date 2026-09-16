import {
	Controller,
	Get,
	HttpCode,
	NotFoundException,
	Param,
	ParseUUIDPipe,
	Post,
	Query,
	UnprocessableEntityException,
	UseGuards,
} from '@nestjs/common';
import {
	ApiCookieAuth,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger';

import { GetCatalogClassroomGameListQuery, GetCatalogClassroomGameQuery } from '../../core/feature/catalog/query/get.catalog.classroom-game.query';
import { AcquireClassroomGameCommand, AcquireClassroomGameCommandData } from '../../core/feature/game/command/acquire.classroom.game.command';
import { AuthSession } from '../../core/infrastructure/auth/auth.decorator';
import type { AuthSessionData } from '../../core/infrastructure/auth/model/auth.session.model';
import { SessionAuthGuard } from '../auth/session.auth.guard';
import {
	GetClassroomGameListQueryDto,
	GetClassroomGameListResponseDto,
	GetClassroomGameResponseDto,
} from './classroom-game.dto';

@ApiTags('Catalog Classroom Games')
@Controller('api/v1/catalog/classroom-game')
export class ClassroomGameController {

	constructor(
		private readonly acquireClassroomGameCommand: AcquireClassroomGameCommand,
		private readonly getClassroomGameListQuery: GetCatalogClassroomGameListQuery,
		private readonly getClassroomGameQuery: GetCatalogClassroomGameQuery,
	) {}

	@Post(':id/acquisition')
	@HttpCode(200)
	@UseGuards(SessionAuthGuard)
	@ApiCookieAuth()
	@ApiOperation({ summary: 'Acquire a classroom game without payment' })
	@ApiParam({ format: 'uuid', name: 'id' })
	@ApiOkResponse({ type: GetClassroomGameResponseDto })
	async acquireClassroomGame(
		@Param('id', ParseUUIDPipe) id: string,
		@AuthSession() session: AuthSessionData,
	): Promise<GetClassroomGameResponseDto> {
		const result = await this.acquireClassroomGameCommand.execute(
			AcquireClassroomGameCommandData.create({ classroomGameId: id, userId: session.user.id }),
		);

		if (result.validationResult) {
			throw new UnprocessableEntityException(result.validationResult);
		}

		return GetClassroomGameResponseDto.fromEntity(result.classroomGame!);
	}

	@Get()
	@ApiOperation({ summary: 'List classroom game assignments' })
	@ApiOkResponse({ type: GetClassroomGameListResponseDto })
	async getClassroomGameList(
		@Query() query: GetClassroomGameListQueryDto,
	): Promise<GetClassroomGameListResponseDto> {
		const result = await this.getClassroomGameListQuery.execute({
			filterBy: query.filterBy,
			pagination: query.pagination,
		});
		return GetClassroomGameListResponseDto.fromQueryResult(result);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a classroom game assignment by ID' })
	@ApiParam({ format: 'uuid', name: 'id' })
	@ApiOkResponse({ type: GetClassroomGameResponseDto })
	@ApiNotFoundResponse({ description: 'Classroom game assignment not found' })
	async getClassroomGameById(
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<GetClassroomGameResponseDto> {
		const result = await this.getClassroomGameQuery.execute({ filterBy: { id } });
		if (!result.classroomGame) {
			throw new NotFoundException('Classroom game assignment not found');
		}

		return GetClassroomGameResponseDto.fromEntity(result.classroomGame);
	}

}