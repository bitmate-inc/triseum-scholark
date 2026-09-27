import {
	Body,
	Controller,
	Get,
	NotFoundException,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiConflictResponse,
	ApiCookieAuth,
	ApiCreatedResponse,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';

import { CreateAdminAcquisitionCodesCommand } from '../../core/feature/admin/command/create.admin.acquisition.codes.command';
import { CreateAdminClassroomCommand } from '../../core/feature/admin/command/create.admin.classroom.command';
import { CreateAdminClassroomGameCommand } from '../../core/feature/admin/command/create.admin.classroom.game.command';
import { CreateAdminCourseCommand } from '../../core/feature/admin/command/create.admin.course.command';
import { CreateAdminGameCommand } from '../../core/feature/admin/command/create.admin.game.command';
import { CreateAdminGameOfferCommand } from '../../core/feature/admin/command/create.admin.game.offer.command';
import { CreateAdminGameVersionCommand } from '../../core/feature/admin/command/create.admin.game.version.command';
import { CreateAdminInstitutionCommand } from '../../core/feature/admin/command/create.admin.institution.command';
import { CreateAdminInstructorCommand } from '../../core/feature/admin/command/create.admin.instructor.command';
import { CreateAdminPublisherCommand } from '../../core/feature/admin/command/create.admin.publisher.command';
import { CreateAdminTaxonomyTermCommand } from '../../core/feature/admin/command/create.admin.taxonomy.term.command';
import { RevokeAdminAcquisitionCodeCommand } from '../../core/feature/admin/command/revoke.admin.acquisition.code.command';
import { UpdateAdminClassroomCommand } from '../../core/feature/admin/command/update.admin.classroom.command';
import { UpdateAdminClassroomGameCommand } from '../../core/feature/admin/command/update.admin.classroom.game.command';
import { UpdateAdminCourseCommand } from '../../core/feature/admin/command/update.admin.course.command';
import { UpdateAdminGameCommand } from '../../core/feature/admin/command/update.admin.game.command';
import { UpdateAdminGameVersionCommand } from '../../core/feature/admin/command/update.admin.game.version.command';
import { UpdateAdminInstitutionCommand } from '../../core/feature/admin/command/update.admin.institution.command';
import { UpdateAdminInstitutionGameOfferCommand } from '../../core/feature/admin/command/update.admin.institution.game.offer.command';
import { UpdateAdminInstructorCommand } from '../../core/feature/admin/command/update.admin.instructor.command';
import { UpdateAdminPublicGameOfferCommand } from '../../core/feature/admin/command/update.admin.public.game.offer.command';
import { UpdateAdminPublisherCommand } from '../../core/feature/admin/command/update.admin.publisher.command';
import { UpdateAdminTaxonomyTermCommand } from '../../core/feature/admin/command/update.admin.taxonomy.term.command';
import { GetAdminAcquisitionCodeListQuery } from '../../core/feature/admin/query/get.admin.acquisition.code.list.query';
import {
	GetAdminAcquisitionListQuery,
	GetAdminLicenseListQuery,
	GetAdminPaymentAttemptListQuery
} from '../../core/feature/admin/query/get.admin.billing.query';
import { GetAdminClassroomGameListQuery, GetAdminClassroomGameQuery } from '../../core/feature/admin/query/get.admin.classroom.game.query';
import { GetAdminClassroomListQuery } from '../../core/feature/admin/query/get.admin.classroom.list.query';
import { GetAdminGameOfferListQuery } from '../../core/feature/admin/query/get.admin.game.offer.query';
import { GetAdminGameListQuery, GetAdminGameQuery } from '../../core/feature/admin/query/get.admin.game.query';
import { GetAdminInstructorListQuery, GetAdminInstructorQuery } from '../../core/feature/admin/query/get.admin.instructor.query';
import { GetAdminPublisherListQuery, GetAdminPublisherQuery } from '../../core/feature/admin/query/get.admin.publisher.query';
import { GetAdminTaxonomyTermListQuery } from '../../core/feature/admin/query/get.admin.taxonomy.term.query';
import { GetAdminUserListQuery } from '../../core/feature/admin/query/get.admin.user.list.query';
import { GetCatalogClassroomQuery } from '../../core/feature/catalog/query/get.catalog.classroom.query';
import { GetCatalogCourseListQuery, GetCatalogCourseQuery } from '../../core/feature/catalog/query/get.catalog.course.query';
import { GetCatalogInstitutionListQuery, GetCatalogInstitutionQuery } from '../../core/feature/catalog/query/get.catalog.institution.query';
import { GetUserQuery, GetUserQueryData } from '../../core/feature/user/query/get.user.query';
import { AuthSession } from '../../core/infrastructure/auth/auth.decorator';
import type { AuthSessionData } from '../../core/infrastructure/auth/model/auth.session.model';
import { UserResponseDto } from '../auth/auth.dto';
import { SessionAuthGuard } from '../auth/session.auth.guard';
import { GetClassroomListQueryDto, GetClassroomResponseDto } from '../catalog/classroom.dto';
import {
	GetCourseListQueryDto,
	GetCourseListResponseDto,
	GetCourseResponseDto
} from '../catalog/course.dto';
import {
	GetInstitutionListQueryDto,
	GetInstitutionListResponseDto,
	GetInstitutionResponseDto
} from '../catalog/institution.dto';
import {
	AdminAcquisitionCodeListItemResponseDto,
	CreateAdminAcquisitionCodesResponseDto,
	GetAdminAcquisitionCodeListQueryDto,
	GetAdminAcquisitionCodeListResponseDto
} from './admin.acquisition-code.dto';
import { CreateAdminAcquisitionCodesRequestDto , RevokeAdminAcquisitionCodeRequestDto } from './admin.acquisition-code.mutation.dto';
import { AdminAuthGuard } from './admin.auth.guard';
import {
	GetAdminAcquisitionDetailResponseDto,
	GetAdminAcquisitionListQueryDto,
	GetAdminAcquisitionListResponseDto,
	GetAdminLicenseListQueryDto,
	GetAdminLicenseListResponseDto,
	GetAdminPaymentAttemptListQueryDto,
	GetAdminPaymentAttemptListResponseDto,
} from './admin.billing.dto';
import { GetAdminClassroomListResponseDto } from './admin.classroom.dto';
import { CreateAdminClassroomRequestDto, UpdateAdminClassroomRequestDto } from './admin.classroom.mutation.dto';
import {
	GetAdminClassroomGameListQueryDto,
	GetAdminClassroomGameListResponseDto,
	GetAdminClassroomGameResponseDto,
} from './admin.classroom-game.dto';
import { CreateAdminClassroomGameRequestDto, UpdateAdminClassroomGameRequestDto } from './admin.classroom-game.mutation.dto';
import { CreateAdminCourseRequestDto, UpdateAdminCourseRequestDto } from './admin.course.mutation.dto';
import {
	GetAdminGameListQueryDto,
	GetAdminGameListResponseDto,
	GetAdminGameResponseDto
} from './admin.game.dto';
import { CreateAdminGameRequestDto, UpdateAdminGameRequestDto } from './admin.game.mutation.dto';
import { GetAdminGameOfferListQueryDto, GetAdminGameOfferListResponseDto } from './admin.game-offer.dto';
import {
	CreateAdminInstitutionGameOfferRequestDto,
	CreateAdminPublicGameOfferRequestDto,
	UpdateAdminInstitutionGameOfferRequestDto,
	UpdateAdminPublicGameOfferRequestDto,
} from './admin.game-offer.mutation.dto';
import { CreateAdminGameVersionRequestDto, UpdateAdminGameVersionRequestDto } from './admin.game-version.mutation.dto';
import { CreateAdminInstitutionRequestDto, UpdateAdminInstitutionRequestDto } from './admin.institution.mutation.dto';
import {
	GetAdminInstructorListQueryDto,
	GetAdminInstructorListResponseDto,
	GetAdminInstructorResponseDto,
} from './admin.instructor.dto';
import { CreateAdminInstructorRequestDto, UpdateAdminInstructorRequestDto } from './admin.instructor.mutation.dto';
import {
	GetAdminPublisherListQueryDto,
	GetAdminPublisherListResponseDto,
	GetAdminPublisherResponseDto,
} from './admin.publisher.dto';
import { CreateAdminPublisherRequestDto, UpdateAdminPublisherRequestDto } from './admin.publisher.mutation.dto';
import {
	AdminTaxonomyTermResponseDto,
	GetAdminTaxonomyTermListQueryDto,
	GetAdminTaxonomyTermListResponseDto
} from './admin.taxonomy.dto';
import { CreateAdminTaxonomyTermRequestDto, UpdateAdminTaxonomyTermRequestDto } from './admin.taxonomy.mutation.dto';
import { GetAdminUserListQueryDto, GetAdminUserListResponseDto } from './admin.user.dto';

@ApiTags('Admin')
@ApiCookieAuth()
@ApiForbiddenResponse({ description: 'An administrator account is required' })
@UseGuards(SessionAuthGuard, AdminAuthGuard)
@Controller('api/v1/admin')
export class AdminController {

	constructor(
		private readonly createAdminAcquisitionCodesCommand: CreateAdminAcquisitionCodesCommand,
		private readonly revokeAdminAcquisitionCodeCommand: RevokeAdminAcquisitionCodeCommand,
		private readonly createAdminClassroomCommand: CreateAdminClassroomCommand,
		private readonly createAdminClassroomGameCommand: CreateAdminClassroomGameCommand,
		private readonly createAdminCourseCommand: CreateAdminCourseCommand,
		private readonly createAdminInstitutionCommand: CreateAdminInstitutionCommand,
		private readonly createAdminInstructorCommand: CreateAdminInstructorCommand,
		private readonly createAdminGameCommand: CreateAdminGameCommand,
		private readonly createAdminGameOfferCommand: CreateAdminGameOfferCommand,
		private readonly createAdminGameVersionCommand: CreateAdminGameVersionCommand,
		private readonly createAdminPublisherCommand: CreateAdminPublisherCommand,
		private readonly createAdminTaxonomyTermCommand: CreateAdminTaxonomyTermCommand,
		private readonly getAdminAcquisitionListQuery: GetAdminAcquisitionListQuery,
		private readonly getAdminAcquisitionCodeListQuery: GetAdminAcquisitionCodeListQuery,
		private readonly getAdminClassroomGameListQuery: GetAdminClassroomGameListQuery,
		private readonly getAdminClassroomGameQuery: GetAdminClassroomGameQuery,
		private readonly getAdminClassroomListQuery: GetAdminClassroomListQuery,
		private readonly getAdminGameListQuery: GetAdminGameListQuery,
		private readonly getAdminGameOfferListQuery: GetAdminGameOfferListQuery,
		private readonly getAdminGameQuery: GetAdminGameQuery,
		private readonly getAdminInstructorListQuery: GetAdminInstructorListQuery,
		private readonly getAdminInstructorQuery: GetAdminInstructorQuery,
		private readonly getAdminLicenseListQuery: GetAdminLicenseListQuery,
		private readonly getAdminPaymentAttemptListQuery: GetAdminPaymentAttemptListQuery,
		private readonly getAdminPublisherListQuery: GetAdminPublisherListQuery,
		private readonly getAdminPublisherQuery: GetAdminPublisherQuery,
		private readonly getAdminTaxonomyTermListQuery: GetAdminTaxonomyTermListQuery,
		private readonly getAdminUserListQuery: GetAdminUserListQuery,
		private readonly getCatalogClassroomQuery: GetCatalogClassroomQuery,
		private readonly getCatalogCourseListQuery: GetCatalogCourseListQuery,
		private readonly getCatalogCourseQuery: GetCatalogCourseQuery,
		private readonly getCatalogInstitutionListQuery: GetCatalogInstitutionListQuery,
		private readonly getCatalogInstitutionQuery: GetCatalogInstitutionQuery,
		private readonly getUserQuery: GetUserQuery,
		private readonly updateAdminInstitutionCommand: UpdateAdminInstitutionCommand,
		private readonly updateAdminCourseCommand: UpdateAdminCourseCommand,
		private readonly updateAdminClassroomCommand: UpdateAdminClassroomCommand,
		private readonly updateAdminClassroomGameCommand: UpdateAdminClassroomGameCommand,
		private readonly updateAdminInstructorCommand: UpdateAdminInstructorCommand,
		private readonly updateAdminGameCommand: UpdateAdminGameCommand,
		private readonly updateAdminGameVersionCommand: UpdateAdminGameVersionCommand,
		private readonly updateAdminInstitutionGameOfferCommand: UpdateAdminInstitutionGameOfferCommand,
		private readonly updateAdminPublicGameOfferCommand: UpdateAdminPublicGameOfferCommand,
		private readonly updateAdminPublisherCommand: UpdateAdminPublisherCommand,
		private readonly updateAdminTaxonomyTermCommand: UpdateAdminTaxonomyTermCommand,
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

	@Post('institutions')
	@ApiOperation({ summary: 'Create an institution for portal administration' })
	@ApiCreatedResponse({ type: GetInstitutionResponseDto })
	@ApiConflictResponse({ description: 'An institution with this slug already exists' })
	async createInstitution(
		@Body() body: CreateAdminInstitutionRequestDto,
	): Promise<GetInstitutionResponseDto> {
		const institution = await this.createAdminInstitutionCommand.execute(body);
		return GetInstitutionResponseDto.fromEntity(institution);
	}

	@Patch('institutions/:id')
	@ApiOperation({ summary: 'Update institution details or status for portal administration' })
	@ApiOkResponse({ type: GetInstitutionResponseDto })
	@ApiConflictResponse({ description: 'The slug is in use or active dependent records prevent deactivation' })
	@ApiNotFoundResponse({ description: 'Institution not found' })
	async updateInstitution(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: UpdateAdminInstitutionRequestDto,
	): Promise<GetInstitutionResponseDto> {
		const institution = await this.updateAdminInstitutionCommand.execute(id, body);
		return GetInstitutionResponseDto.fromEntity(institution);
	}

	@Get('classrooms')
	@ApiOperation({ summary: 'List classrooms for portal administration' })
	@ApiOkResponse({ type: GetAdminClassroomListResponseDto })
	async getClassroomList(
		@Query() query: GetClassroomListQueryDto,
	): Promise<GetAdminClassroomListResponseDto> {
		const result = await this.getAdminClassroomListQuery.execute({
			filterBy: query.filterBy,
			pagination: query.pagination,
		});

		return GetAdminClassroomListResponseDto.fromQueryResult(result);
	}

	@Get('classrooms/:id')
	@ApiOperation({ summary: 'Get a classroom for portal administration' })
	@ApiOkResponse({ type: GetClassroomResponseDto })
	@ApiNotFoundResponse({ description: 'Classroom not found' })
	async getClassroomById(
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<GetClassroomResponseDto> {
		const result = await this.getCatalogClassroomQuery.execute({ filterBy: { id } });
		if (!result.classroom) {
			throw new NotFoundException('Classroom not found');
		}

		return GetClassroomResponseDto.fromEntity(result.classroom);
	}

	@Post('classrooms')
	@ApiOperation({ summary: 'Create a classroom for portal administration' })
	@ApiCreatedResponse({ type: GetClassroomResponseDto })
	@ApiConflictResponse({ description: 'The classroom slug or institution code is already in use, or selected associations are incompatible' })
	async createClassroom(
		@Body() body: CreateAdminClassroomRequestDto,
	): Promise<GetClassroomResponseDto> {
		const classroom = await this.createAdminClassroomCommand.execute(body);
		return GetClassroomResponseDto.fromEntity(classroom);
	}

	@Patch('classrooms/:id')
	@ApiOperation({ summary: 'Update classroom details, associations, or status for portal administration' })
	@ApiOkResponse({ type: GetClassroomResponseDto })
	@ApiConflictResponse({ description: 'The classroom slug or institution code is already in use, or selected associations are incompatible' })
	@ApiNotFoundResponse({ description: 'Classroom or selected association not found' })
	async updateClassroom(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: UpdateAdminClassroomRequestDto,
	): Promise<GetClassroomResponseDto> {
		const classroom = await this.updateAdminClassroomCommand.execute(id, body);
		return GetClassroomResponseDto.fromEntity(classroom);
	}

	@Post('classroom-games')
	@ApiOperation({ summary: 'Create an immutable classroom game assignment from an institution offer' })
	@ApiCreatedResponse({ type: GetAdminClassroomGameResponseDto })
	@ApiBadRequestResponse({ description: 'Assignment end date must be after its start date' })
	@ApiNotFoundResponse({ description: 'Classroom or institution offer not found' })
	async createClassroomGame(
		@Body() body: CreateAdminClassroomGameRequestDto,
	): Promise<GetAdminClassroomGameResponseDto> {
		const classroomGame = await this.createAdminClassroomGameCommand.execute({
			classroomId: body.classroomId,
			endAt: new Date(body.endAt),
			institutionGameOfferId: body.institutionGameOfferId,
			publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
			startAt: new Date(body.startAt),
		});
		const result = await this.getAdminClassroomGameQuery.execute({ filterBy: { id: classroomGame.id } });
		if (!result.classroomGame) {
			throw new NotFoundException('Classroom game assignment not found.');
		}
		return GetAdminClassroomGameResponseDto.fromEntity(result.classroomGame);
	}

	@Get('classroom-games')
	@ApiOperation({ summary: 'List classroom game assignments for portal administration' })
	@ApiOkResponse({ type: GetAdminClassroomGameListResponseDto })
	async getClassroomGameList(
		@Query() query: GetAdminClassroomGameListQueryDto,
	): Promise<GetAdminClassroomGameListResponseDto> {
		const result = await this.getAdminClassroomGameListQuery.execute({
			filterBy: query.adminFilterBy,
			pagination: query.pagination,
		});
		return GetAdminClassroomGameListResponseDto.fromQueryResult(result);
	}

	@Get('classroom-games/:id')
	@ApiOperation({ summary: 'Get a classroom game assignment for portal administration' })
	@ApiOkResponse({ type: GetAdminClassroomGameResponseDto })
	@ApiNotFoundResponse({ description: 'Classroom game assignment not found' })
	async getClassroomGameById(
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<GetAdminClassroomGameResponseDto> {
		const result = await this.getAdminClassroomGameQuery.execute({ filterBy: { id } });
		if (!result.classroomGame) {
			throw new NotFoundException('Classroom game assignment not found');
		}

		return GetAdminClassroomGameResponseDto.fromEntity(result.classroomGame);
	}

	@Patch('classroom-games/:id')
	@ApiOperation({ summary: 'Update an unpublished classroom game assignment' })
	@ApiOkResponse({ type: GetAdminClassroomGameResponseDto })
	@ApiConflictResponse({ description: 'Published assignments are immutable; create a replacement instead' })
	@ApiNotFoundResponse({ description: 'Assignment or selected association not found' })
	async updateClassroomGame(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: UpdateAdminClassroomGameRequestDto,
	): Promise<GetAdminClassroomGameResponseDto> {
		const { endAt, publishedAt, startAt, ...fields } = body;
		await this.updateAdminClassroomGameCommand.execute(id, {
			...fields,
			...(endAt === undefined ? {} : { endAt: new Date(endAt) }),
			...(publishedAt === undefined ? {} : { publishedAt: publishedAt === null ? null : new Date(publishedAt) }),
			...(startAt === undefined ? {} : { startAt: new Date(startAt) }),
		});
		const result = await this.getAdminClassroomGameQuery.execute({ filterBy: { id } });
		if (!result.classroomGame) {
			throw new NotFoundException('Classroom game assignment not found.');
		}
		return GetAdminClassroomGameResponseDto.fromEntity(result.classroomGame);
	}

	@Get('instructors')
	@ApiOperation({ summary: 'List instructors for portal administration' })
	@ApiOkResponse({ type: GetAdminInstructorListResponseDto })
	async getInstructorList(
		@Query() query: GetAdminInstructorListQueryDto,
	): Promise<GetAdminInstructorListResponseDto> {
		const result = await this.getAdminInstructorListQuery.execute({
			filterBy: query.adminFilterBy,
			pagination: query.pagination,
		});
		return GetAdminInstructorListResponseDto.fromQueryResult(result);
	}

	@Get('instructors/:id')
	@ApiOperation({ summary: 'Get an instructor and learning-space memberships' })
	@ApiOkResponse({ type: GetAdminInstructorResponseDto })
	@ApiNotFoundResponse({ description: 'Instructor not found' })
	async getInstructorById(
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<GetAdminInstructorResponseDto> {
		const result = await this.getAdminInstructorQuery.execute({ filterBy: { id } });
		if (!result.instructor) {
			throw new NotFoundException('Instructor not found');
		}

		return GetAdminInstructorResponseDto.fromQueryResult({
			classroomList: result.classroomList,
			instructor: result.instructor,
			institutionList: result.institutionList,
		});
	}

	@Post('instructors')
	@ApiOperation({ summary: 'Create an instructor for portal administration' })
	@ApiCreatedResponse({ type: GetAdminInstructorResponseDto })
	@ApiConflictResponse({ description: 'An instructor with this slug already exists' })
	async createInstructor(
		@Body() body: CreateAdminInstructorRequestDto,
	): Promise<GetAdminInstructorResponseDto> {
		const instructor = await this.createAdminInstructorCommand.execute(body);
		const result = await this.getAdminInstructorQuery.execute({ filterBy: { id: instructor.id } });
		return GetAdminInstructorResponseDto.fromQueryResult({ ...result, instructor });
	}

	@Patch('instructors/:id')
	@ApiOperation({ summary: 'Update an instructor profile or memberships for portal administration' })
	@ApiOkResponse({ type: GetAdminInstructorResponseDto })
	@ApiConflictResponse({ description: 'An instructor with this slug already exists' })
	@ApiNotFoundResponse({ description: 'Instructor or selected membership not found' })
	async updateInstructor(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: UpdateAdminInstructorRequestDto,
	): Promise<GetAdminInstructorResponseDto> {
		const instructor = await this.updateAdminInstructorCommand.execute(id, body);
		const result = await this.getAdminInstructorQuery.execute({ filterBy: { id } });
		return GetAdminInstructorResponseDto.fromQueryResult({ ...result, instructor });
	}

	@Get('publishers')
	@ApiOperation({ summary: 'List publishers for portal administration' })
	@ApiOkResponse({ type: GetAdminPublisherListResponseDto })
	async getPublisherList(
		@Query() query: GetAdminPublisherListQueryDto,
	): Promise<GetAdminPublisherListResponseDto> {
		const result = await this.getAdminPublisherListQuery.execute({
			filterBy: query.adminFilterBy,
			pagination: query.pagination,
		});
		return GetAdminPublisherListResponseDto.fromQueryResult(result);
	}

	@Post('publishers')
	@ApiOperation({ summary: 'Create a publisher for portal administration' })
	@ApiCreatedResponse({ type: GetAdminPublisherResponseDto })
	@ApiConflictResponse({ description: 'A publisher with this slug already exists' })
	async createPublisher(
		@Body() body: CreateAdminPublisherRequestDto,
	): Promise<GetAdminPublisherResponseDto> {
		const publisher = await this.createAdminPublisherCommand.execute(body);
		const result = await this.getAdminPublisherQuery.execute({ filterBy: { id: publisher.id } });
		if (!result.publisher) {
			throw new NotFoundException('Publisher not found');
		}
		return GetAdminPublisherResponseDto.fromQueryResult({ ...result, publisher });
	}

	@Patch('publishers/:id')
	@ApiOperation({ summary: 'Update a publisher profile for portal administration' })
	@ApiOkResponse({ type: GetAdminPublisherResponseDto })
	@ApiConflictResponse({ description: 'A publisher with this slug already exists' })
	@ApiNotFoundResponse({ description: 'Publisher not found' })
	async updatePublisher(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: UpdateAdminPublisherRequestDto,
	): Promise<GetAdminPublisherResponseDto> {
		const publisher = await this.updateAdminPublisherCommand.execute(id, body);
		const result = await this.getAdminPublisherQuery.execute({ filterBy: { id } });
		if (!result.publisher) {
			throw new NotFoundException('Publisher not found');
		}
		return GetAdminPublisherResponseDto.fromQueryResult({ ...result, publisher });
	}

	@Get('publishers/:id')
	@ApiOperation({ summary: 'Get a publisher and its game catalog for portal administration' })
	@ApiOkResponse({ type: GetAdminPublisherResponseDto })
	@ApiNotFoundResponse({ description: 'Publisher not found' })
	async getPublisherById(
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<GetAdminPublisherResponseDto> {
		const result = await this.getAdminPublisherQuery.execute({ filterBy: { id } });
		if (!result.publisher) {
			throw new NotFoundException('Publisher not found');
		}

		return GetAdminPublisherResponseDto.fromQueryResult({
			gameList: result.gameList,
			gameVersionList: result.gameVersionList,
			publisher: result.publisher,
		});
	}

	@Get('games')
	@ApiOperation({ summary: 'List games for portal administration' })
	@ApiOkResponse({ type: GetAdminGameListResponseDto })
	async getGameList(
		@Query() query: GetAdminGameListQueryDto,
	): Promise<GetAdminGameListResponseDto> {
		const result = await this.getAdminGameListQuery.execute({
			filterBy: query.adminFilterBy,
			pagination: query.pagination,
		});
		return GetAdminGameListResponseDto.fromQueryResult(result);
	}

	@Post('games')
	@ApiOperation({ summary: 'Create a game for portal administration' })
	@ApiCreatedResponse({ type: GetAdminGameResponseDto })
	@ApiConflictResponse({ description: 'A game with this slug already exists' })
	@ApiNotFoundResponse({ description: 'Publisher not found' })
	async createGame(
		@Body() body: CreateAdminGameRequestDto,
	): Promise<GetAdminGameResponseDto> {
		const game = await this.createAdminGameCommand.execute({
			...body,
			publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
		});
		const result = await this.getAdminGameQuery.execute({ filterBy: { id: game.id } });
		return GetAdminGameResponseDto.fromQueryResult({ ...result, game });
	}

	@Patch('games/:id')
	@ApiOperation({ summary: 'Update a game profile for portal administration' })
	@ApiOkResponse({ type: GetAdminGameResponseDto })
	@ApiConflictResponse({ description: 'A game with this slug already exists' })
	@ApiNotFoundResponse({ description: 'Game not found' })
	async updateGame(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: UpdateAdminGameRequestDto,
	): Promise<GetAdminGameResponseDto> {
		const game = await this.updateAdminGameCommand.execute(id, {
			...body,
			publishedAt: body.publishedAt === undefined ? undefined : body.publishedAt === null ? null : new Date(body.publishedAt),
		});
		const result = await this.getAdminGameQuery.execute({ filterBy: { id } });
		return GetAdminGameResponseDto.fromQueryResult({ ...result, game });
	}

	@Post('games/:id/versions')
	@ApiOperation({ summary: 'Create an immutable publisher version and its variants for a game' })
	@ApiCreatedResponse({ type: GetAdminGameResponseDto })
	@ApiConflictResponse({ description: 'Publisher version or variant already exists' })
	@ApiNotFoundResponse({ description: 'Game not found' })
	async createGameVersion(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: CreateAdminGameVersionRequestDto,
	): Promise<GetAdminGameResponseDto> {
		await this.createAdminGameVersionCommand.execute({
			description: body.description,
			gameId: id,
			publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
			publisherVersion: body.publisherVersion,
			runUrl: body.runUrl,
			variantList: body.variantList,
		});
		const result = await this.getAdminGameQuery.execute({ filterBy: { id } });
		if (!result.game) {
			throw new NotFoundException('Game not found.');
		}
		return GetAdminGameResponseDto.fromQueryResult({ ...result, game: result.game });
	}

	@Patch('games/:id/versions/:versionId')
	@ApiOperation({ summary: 'Update an unpublished game version and its variants' })
	@ApiOkResponse({ type: GetAdminGameResponseDto })
	@ApiConflictResponse({ description: 'Published versions are immutable or the version data conflicts' })
	@ApiNotFoundResponse({ description: 'Game version not found' })
	async updateGameVersion(
		@Param('id', ParseUUIDPipe) id: string,
		@Param('versionId', ParseUUIDPipe) versionId: string,
		@Body() body: UpdateAdminGameVersionRequestDto,
	): Promise<GetAdminGameResponseDto> {
		const { publishedAt, ...fields } = body;
		await this.updateAdminGameVersionCommand.execute(id, versionId, {
			...fields,
			...(publishedAt === undefined ? {} : { publishedAt: publishedAt === null ? null : new Date(publishedAt) }),
		});
		const result = await this.getAdminGameQuery.execute({ filterBy: { id } });
		if (!result.game) {
			throw new NotFoundException('Game not found.');
		}
		return GetAdminGameResponseDto.fromQueryResult({ ...result, game: result.game });
	}

	@Post('games/:id/public-offers')
	@ApiOperation({ summary: 'Create a public offer for a game variant' })
	@ApiCreatedResponse({ type: GetAdminGameResponseDto })
	@ApiNotFoundResponse({ description: 'Game or variant not found' })
	async createPublicGameOffer(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: CreateAdminPublicGameOfferRequestDto,
	): Promise<GetAdminGameResponseDto> {
		await this.createAdminGameOfferCommand.createPublic({
			available: body.available,
			gameId: id,
			gameVariantId: body.gameVariantId,
			price: body.price,
			publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
		});
		const result = await this.getAdminGameQuery.execute({ filterBy: { id } });
		if (!result.game) {
			throw new NotFoundException('Game not found.');
		}
		return GetAdminGameResponseDto.fromQueryResult({ ...result, game: result.game });
	}

	@Post('games/:id/institution-offers')
	@ApiOperation({ summary: 'Create an institution offer for a game variant' })
	@ApiCreatedResponse({ type: GetAdminGameResponseDto })
	@ApiConflictResponse({ description: 'An offer already exists for this variant and payor' })
	@ApiNotFoundResponse({ description: 'Game or variant not found' })
	async createInstitutionGameOffer(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: CreateAdminInstitutionGameOfferRequestDto,
	): Promise<GetAdminGameResponseDto> {
		await this.createAdminGameOfferCommand.createInstitution({
			allocatedLicenseQuantity: body.allocatedLicenseQuantity,
			designatedPayor: body.designatedPayor,
			gameId: id,
			gameVariantId: body.gameVariantId,
			licenseDurationDays: body.licenseDurationDays,
			price: body.price,
			publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
		});
		const result = await this.getAdminGameQuery.execute({ filterBy: { id } });
		if (!result.game) {
			throw new NotFoundException('Game not found.');
		}
		return GetAdminGameResponseDto.fromQueryResult({ ...result, game: result.game });
	}

	@Patch('games/:id/public-offers/:offerId')
	@ApiOperation({ summary: 'Update price or availability for a public game offer' })
	@ApiOkResponse({ type: GetAdminGameResponseDto })
	@ApiNotFoundResponse({ description: 'Public offer not found for this game' })
	async updatePublicGameOffer(
		@Param('id', ParseUUIDPipe) id: string,
		@Param('offerId', ParseUUIDPipe) offerId: string,
		@Body() body: UpdateAdminPublicGameOfferRequestDto,
	): Promise<GetAdminGameResponseDto> {
		await this.updateAdminPublicGameOfferCommand.execute(id, offerId, {
			available: body.available,
			price: body.price,
			publishedAt: body.publishedAt === undefined ? undefined : body.publishedAt === null ? null : new Date(body.publishedAt),
		});
		const result = await this.getAdminGameQuery.execute({ filterBy: { id } });
		if (!result.game) {
			throw new NotFoundException('Game not found.');
		}
		return GetAdminGameResponseDto.fromQueryResult({ ...result, game: result.game });
	}

	@Patch('games/:id/institution-offers/:offerId')
	@ApiOperation({ summary: 'Update an unpublished institution game offer' })
	@ApiOkResponse({ type: GetAdminGameResponseDto })
	@ApiConflictResponse({ description: 'Published offers are immutable or the offer conflicts with an existing variant offer' })
	@ApiNotFoundResponse({ description: 'Institution offer not found for this game' })
	async updateInstitutionGameOffer(
		@Param('id', ParseUUIDPipe) id: string,
		@Param('offerId', ParseUUIDPipe) offerId: string,
		@Body() body: UpdateAdminInstitutionGameOfferRequestDto,
	): Promise<GetAdminGameResponseDto> {
		const { publishedAt, ...fields } = body;
		await this.updateAdminInstitutionGameOfferCommand.execute(id, offerId, {
			...fields,
			...(publishedAt === undefined ? {} : { publishedAt: publishedAt === null ? null : new Date(publishedAt) }),
		});
		const result = await this.getAdminGameQuery.execute({ filterBy: { id } });
		if (!result.game) {
			throw new NotFoundException('Game not found.');
		}
		return GetAdminGameResponseDto.fromQueryResult({ ...result, game: result.game });
	}

	@Get('games/:id')
	@ApiOperation({ summary: 'Get a game and catalog offers for portal administration' })
	@ApiOkResponse({ type: GetAdminGameResponseDto })
	@ApiNotFoundResponse({ description: 'Game not found' })
	async getGameById(
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<GetAdminGameResponseDto> {
		const result = await this.getAdminGameQuery.execute({ filterBy: { id } });
		if (!result.game) {
			throw new NotFoundException('Game not found');
		}

		return GetAdminGameResponseDto.fromQueryResult({
			game: result.game,
			gameVersionList: result.gameVersionList,
			gameVariantList: result.gameVariantList,
			institutionGameOfferList: result.institutionGameOfferList,
			publicGameOfferList: result.publicGameOfferList,
		});
	}

	@Get('game-offers')
	@ApiOperation({ summary: 'List game offers for portal administration' })
	@ApiOkResponse({ type: GetAdminGameOfferListResponseDto })
	async getGameOfferList(
		@Query() query: GetAdminGameOfferListQueryDto,
	): Promise<GetAdminGameOfferListResponseDto> {
		const result = await this.getAdminGameOfferListQuery.execute({
			filterBy: query.adminFilterBy,
			pagination: query.pagination,
		});
		return GetAdminGameOfferListResponseDto.fromQueryResult(result);
	}

	@Get('taxonomy')
	@ApiOperation({ summary: 'List taxonomy terms for portal administration' })
	@ApiOkResponse({ type: GetAdminTaxonomyTermListResponseDto })
	async getTaxonomyTermList(
		@Query() query: GetAdminTaxonomyTermListQueryDto,
	): Promise<GetAdminTaxonomyTermListResponseDto> {
		const result = await this.getAdminTaxonomyTermListQuery.execute({
			filterBy: query.adminFilterBy,
			pagination: query.pagination,
		});
		return GetAdminTaxonomyTermListResponseDto.fromQueryResult(result);
	}

	@Post('taxonomy')
	@ApiOperation({ summary: 'Create a taxonomy term for portal administration' })
	@ApiCreatedResponse({ type: AdminTaxonomyTermResponseDto })
	@ApiConflictResponse({ description: 'A term with this type and slug already exists' })
	async createTaxonomyTerm(
		@Body() body: CreateAdminTaxonomyTermRequestDto,
	): Promise<AdminTaxonomyTermResponseDto> {
		const taxonomyTerm = await this.createAdminTaxonomyTermCommand.execute(body);
		return AdminTaxonomyTermResponseDto.fromEntity(taxonomyTerm);
	}

	@Patch('taxonomy/:id')
	@ApiOperation({ summary: 'Update a taxonomy term for portal administration' })
	@ApiOkResponse({ type: AdminTaxonomyTermResponseDto })
	@ApiConflictResponse({ description: 'A term with this type and slug already exists' })
	@ApiNotFoundResponse({ description: 'Taxonomy term not found' })
	async updateTaxonomyTerm(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: UpdateAdminTaxonomyTermRequestDto,
	): Promise<AdminTaxonomyTermResponseDto> {
		const taxonomyTerm = await this.updateAdminTaxonomyTermCommand.execute(id, body);
		return AdminTaxonomyTermResponseDto.fromEntity(taxonomyTerm);
	}

	@Get('users')
	@ApiOperation({ summary: 'List user accounts for portal administration' })
	@ApiOkResponse({ type: GetAdminUserListResponseDto })
	async getUserList(
		@Query() query: GetAdminUserListQueryDto,
	): Promise<GetAdminUserListResponseDto> {
		const result = await this.getAdminUserListQuery.execute({
			filterBy: query.adminFilterBy,
			pagination: query.pagination,
		});
		return GetAdminUserListResponseDto.fromQueryResult(result);
	}

	@Get('billing/acquisitions')
	@ApiOperation({ summary: 'List completed game acquisitions for portal administration' })
	@ApiOkResponse({ type: GetAdminAcquisitionListResponseDto })
	async getAcquisitionList(
		@Query() query: GetAdminAcquisitionListQueryDto,
	): Promise<GetAdminAcquisitionListResponseDto> {
		const result = await this.getAdminAcquisitionListQuery.execute({
			filterBy: { mechanism: query.mechanism, q: query.q },
			pagination: query.pagination,
		});
		return GetAdminAcquisitionListResponseDto.fromQueryResult(result);
	}

	@Get('billing/acquisitions/:id')
	@ApiOperation({ summary: 'Get an acquisition, its source, and audit timeline' })
	@ApiOkResponse({ type: GetAdminAcquisitionDetailResponseDto })
	@ApiNotFoundResponse({ description: 'Acquisition not found' })
	async getAcquisition(
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<GetAdminAcquisitionDetailResponseDto> {
		const result = await this.getAdminAcquisitionListQuery.executeOne(id);
		if (!result.acquisition) {
			throw new NotFoundException('Acquisition not found.');
		}
		return GetAdminAcquisitionDetailResponseDto.fromQueryResult(result.acquisition, result.eventList);
	}

	@Get('billing/payment-attempts')
	@ApiOperation({ summary: 'List game payment attempts for portal administration' })
	@ApiOkResponse({ type: GetAdminPaymentAttemptListResponseDto })
	async getPaymentAttemptList(
		@Query() query: GetAdminPaymentAttemptListQueryDto,
	): Promise<GetAdminPaymentAttemptListResponseDto> {
		const result = await this.getAdminPaymentAttemptListQuery.execute({
			filterBy: { q: query.q, status: query.status },
			pagination: query.pagination,
		});
		return GetAdminPaymentAttemptListResponseDto.fromQueryResult(result);
	}

	@Get('billing/licenses')
	@ApiOperation({ summary: 'List game licenses for portal administration' })
	@ApiOkResponse({ type: GetAdminLicenseListResponseDto })
	async getLicenseList(
		@Query() query: GetAdminLicenseListQueryDto,
	): Promise<GetAdminLicenseListResponseDto> {
		const result = await this.getAdminLicenseListQuery.execute({
			filterBy: { q: query.q, status: query.status },
			pagination: query.pagination,
		});
		return GetAdminLicenseListResponseDto.fromQueryResult(result);
	}

	@Get('billing/acquisition-codes')
	@ApiOperation({ summary: 'List institution acquisition codes and their redeemers for portal administration' })
	@ApiOkResponse({ type: GetAdminAcquisitionCodeListResponseDto })
	async getAcquisitionCodeList(
		@Query() query: GetAdminAcquisitionCodeListQueryDto,
	): Promise<GetAdminAcquisitionCodeListResponseDto> {
		const result = await this.getAdminAcquisitionCodeListQuery.execute({
			filterBy: query.adminFilterBy,
			pagination: query.pagination,
		});
		return GetAdminAcquisitionCodeListResponseDto.fromQueryResult(result);
	}

	@Get('acquisition-codes/:id')
	@ApiOperation({ summary: 'Get an institution acquisition code and its redeemers for portal administration' })
	@ApiOkResponse({ type: AdminAcquisitionCodeListItemResponseDto })
	@ApiNotFoundResponse({ description: 'Acquisition code not found' })
	async getAcquisitionCode(
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<AdminAcquisitionCodeListItemResponseDto> {
		const result = await this.getAdminAcquisitionCodeListQuery.execute({
			filterBy: { id },
			pagination: { limit: 1, offset: 0 },
		});
		const acquisitionCode = result.acquisitionCodeList[0];
		if (!acquisitionCode) {
			throw new NotFoundException('Acquisition code not found.');
		}

		return AdminAcquisitionCodeListItemResponseDto.fromEntity(
			acquisitionCode,
			result.redemptionListByCodeId.get(acquisitionCode.id!) ?? [],
			result.eventListByCodeId.get(acquisitionCode.id!) ?? [],
		);
	}

	@Post('acquisition-codes')
	@ApiOperation({ summary: 'Generate institution-funded acquisition codes for portal administration' })
	@ApiCreatedResponse({ type: CreateAdminAcquisitionCodesResponseDto })
	@ApiBadRequestResponse({ description: 'Codes require an institution-funded offer and a future expiry date' })
	async createAcquisitionCodes(
		@Body() body: CreateAdminAcquisitionCodesRequestDto,
		@AuthSession() session: AuthSessionData,
	): Promise<CreateAdminAcquisitionCodesResponseDto> {
		const codeList = await this.createAdminAcquisitionCodesCommand.execute(body, session.user.id);
		return { codeList };
	}

	@Patch('acquisition-codes/:id/revoke')
	@ApiOperation({ summary: 'Revoke an unused acquisition code' })
	@ApiOkResponse({ description: 'The acquisition code was revoked.' })
	@ApiBadRequestResponse({ description: 'A non-empty reason is required.' })
	@ApiConflictResponse({ description: 'The acquisition code has already been revoked.' })
	@ApiNotFoundResponse({ description: 'Acquisition code not found.' })
	async revokeAcquisitionCode(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: RevokeAdminAcquisitionCodeRequestDto,
		@AuthSession() session: AuthSessionData,
	): Promise<void> {
		await this.revokeAdminAcquisitionCodeCommand.execute(id, session.user.id, body.reason);
	}

	@Get('courses')
	@ApiOperation({ summary: 'List courses for portal administration' })
	@ApiOkResponse({ type: GetCourseListResponseDto })
	async getCourseList(
		@Query() query: GetCourseListQueryDto,
	): Promise<GetCourseListResponseDto> {
		const result = await this.getCatalogCourseListQuery.execute({
			filterBy: query.filterBy,
			pagination: query.pagination,
		});

		return GetCourseListResponseDto.fromQueryResult(result);
	}

	@Get('courses/:id')
	@ApiOperation({ summary: 'Get a course for portal administration' })
	@ApiOkResponse({ type: GetCourseResponseDto })
	@ApiNotFoundResponse({ description: 'Course not found' })
	async getCourseById(
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<GetCourseResponseDto> {
		const result = await this.getCatalogCourseQuery.execute({ filterBy: { id } });
		if (!result.course) {
			throw new NotFoundException('Course not found');
		}

		return GetCourseResponseDto.fromEntity(result.course);
	}

	@Post('courses')
	@ApiOperation({ summary: 'Create a course for portal administration' })
	@ApiCreatedResponse({ type: GetCourseResponseDto })
	@ApiConflictResponse({ description: 'The course slug or institution code is already in use, or the institution is inactive' })
	async createCourse(
		@Body() body: CreateAdminCourseRequestDto,
	): Promise<GetCourseResponseDto> {
		const course = await this.createAdminCourseCommand.execute(body);
		return GetCourseResponseDto.fromEntity(course);
	}

	@Patch('courses/:id')
	@ApiOperation({ summary: 'Update course details or status for portal administration' })
	@ApiOkResponse({ type: GetCourseResponseDto })
	@ApiConflictResponse({ description: 'The course slug or institution code is already in use, or the institution is inactive' })
	@ApiNotFoundResponse({ description: 'Course or institution not found' })
	async updateCourse(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: UpdateAdminCourseRequestDto,
	): Promise<GetCourseResponseDto> {
		const course = await this.updateAdminCourseCommand.execute(id, body);
		return GetCourseResponseDto.fromEntity(course);
	}

}