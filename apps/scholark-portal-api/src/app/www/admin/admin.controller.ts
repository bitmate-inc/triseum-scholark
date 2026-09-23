import {
	Controller,
	Get,
	NotFoundException,
	Param,
	ParseUUIDPipe,
	Query,
	UseGuards,
} from '@nestjs/common';
import {
	ApiCookieAuth,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';

import { GetCatalogInstitutionListQuery, GetCatalogInstitutionQuery } from '../../core/feature/catalog/query/get.catalog.institution.query';
import { GetUserQuery, GetUserQueryData } from '../../core/feature/user/query/get.user.query';
import { AuthSession } from '../../core/infrastructure/auth/auth.decorator';
import type { AuthSessionData } from '../../core/infrastructure/auth/model/auth.session.model';
import { UserResponseDto } from '../auth/auth.dto';
import { SessionAuthGuard } from '../auth/session.auth.guard';
import {
	GetInstitutionListQueryDto,
	GetInstitutionListResponseDto,
	GetInstitutionResponseDto
} from '../catalog/institution.dto';
import { AdminAuthGuard } from './admin.auth.guard';

@ApiTags('Admin')
@ApiCookieAuth()
@ApiForbiddenResponse({ description: 'An administrator account is required' })
@UseGuards(SessionAuthGuard, AdminAuthGuard)
@Controller('api/v1/admin')
export class AdminController {

	constructor(
		private readonly getCatalogInstitutionListQuery: GetCatalogInstitutionListQuery,
		private readonly getCatalogInstitutionQuery: GetCatalogInstitutionQuery,
		private readonly getUserQuery: GetUserQuery,
	) {}

	@Get('session')
	@ApiOperation({ summary: 'Get the current administrator account' })
	@ApiOkResponse({ type: UserResponseDto })
	async getSession(@AuthSession() session: AuthSessionData): Promise<UserResponseDto> {
		const result = await this.getUserQuery.execute(
			GetUserQueryData.create({ filterBy: { id: session.user.id } }),
		);
		if (!result.user) {
			throw new NotFoundException();
		}

		return UserResponseDto.fromEntity(result.user);
	}

	@Get('institutions')
	@ApiOperation({ summary: 'List institutions for portal administration' })
	@ApiOkResponse({ type: GetInstitutionListResponseDto })
	async getInstitutionList(
		@Query() query: GetInstitutionListQueryDto,
	): Promise<GetInstitutionListResponseDto> {
		const result = await this.getCatalogInstitutionListQuery.execute({
			filterBy: query.filterBy,
			pagination: query.pagination,
		});

		return GetInstitutionListResponseDto.fromQueryResult(result);
	}

	@Get('institutions/:id')
	@ApiOperation({ summary: 'Get an institution for portal administration' })
	@ApiOkResponse({ type: GetInstitutionResponseDto })
	@ApiNotFoundResponse({ description: 'Institution not found' })
	async getInstitutionById(
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<GetInstitutionResponseDto> {
		const result = await this.getCatalogInstitutionQuery.execute({ filterBy: { id } });
		if (!result.institution) {
			throw new NotFoundException('Institution not found');
		}

		return GetInstitutionResponseDto.fromEntity(result.institution);
	}

}