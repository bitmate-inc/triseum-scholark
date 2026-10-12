import {
	Body,
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

import {
	GetCatalogClassroomGameListingListQuery,
	GetCatalogClassroomGameListingQuery,
} from '../../core/feature/catalog/query/get.catalog.classroom-game-listing.query';
import { CreateClassroomGameListingCheckoutCommandData, CreateGameCheckoutCommand } from '../../core/feature/game/command/create.game.checkout.command';
import { RedeemAcquisitionCodeCommand, RedeemAcquisitionCodeCommandData } from '../../core/feature/game/command/redeem.acquisition.code.command';
import { AuthSession } from '../../core/infrastructure/auth/auth.decorator';
import type { AuthSessionData } from '../../core/infrastructure/auth/model/auth.session.model';
import { SessionAuthGuard } from '../auth/session.auth.guard';
import {
	GetClassroomGameListingListQueryDto,
	GetClassroomGameListingListResponseDto,
	GetClassroomGameListingResponseDto,
	RedeemAcquisitionCodeRequestDto,
	RedeemAcquisitionCodeResponseDto,
} from './classroom-game-listing.dto';
import { GameCheckoutResponseDto } from './game.dto';

@ApiTags('Catalog Classroom Game Listings')
@Controller('api/v1/catalog/classroom-game-listing')
export class ClassroomGameListingController {

	constructor(
		private readonly createGameCheckoutCommand: CreateGameCheckoutCommand,
		private readonly redeemAcquisitionCodeCommand: RedeemAcquisitionCodeCommand,
		private readonly getClassroomGameListingListQuery: GetCatalogClassroomGameListingListQuery,
		private readonly getClassroomGameListingQuery: GetCatalogClassroomGameListingQuery,
	) {}

	@Post(':id/redeem-code')
	@HttpCode(200)
	@UseGuards(SessionAuthGuard)
	@ApiCookieAuth()
	@ApiOperation({ summary: 'Redeem an institution-funded acquisition code' })
	@ApiParam({ format: 'uuid', name: 'id' })
	@ApiOkResponse({ type: RedeemAcquisitionCodeResponseDto })
	async redeemAcquisitionCode(
		@Param('id', ParseUUIDPipe) id: string,
		@AuthSession() session: AuthSessionData,
		@Body() body: RedeemAcquisitionCodeRequestDto,
	): Promise<RedeemAcquisitionCodeResponseDto> {
		const result = await this.redeemAcquisitionCodeCommand.execute(
			RedeemAcquisitionCodeCommandData.create({
				classroomGameListingId: id,
				code: body.code,
				userId: session.user.id,
			}),
		);

		if (result.validationResult) {
			throw new UnprocessableEntityException(result.validationResult);
		}

		return {
			licenseDurationDays: result.classroomGameListing!.licenseDurationDays,
			licenseId: result.license!.id!,
		};
	}

	@Post(':id/acquisition')
	@HttpCode(200)
	@UseGuards(SessionAuthGuard)
	@ApiCookieAuth()
	@ApiOperation({ summary: 'Create a Stripe Checkout session for a classroom game listing' })
	@ApiParam({ format: 'uuid', name: 'id' })
	@ApiOkResponse({ type: GameCheckoutResponseDto })
	async acquireClassroomGameListing(
		@Param('id', ParseUUIDPipe) id: string,
		@AuthSession() session: AuthSessionData,
	): Promise<GameCheckoutResponseDto> {
		const result = await this.createGameCheckoutCommand.createClassroomGameListingCheckout(
			CreateClassroomGameListingCheckoutCommandData.create({ classroomGameListingId: id, userId: session.user.id }),
		);

		if (result.validationResult) {
			throw new UnprocessableEntityException(result.validationResult);
		}

		return { checkoutSessionId: result.checkoutSessionId!, checkoutUrl: result.checkoutUrl! };
	}

	@Get()
	@ApiOperation({ summary: 'List classroom game listings' })
	@ApiOkResponse({ type: GetClassroomGameListingListResponseDto })
	async getClassroomGameListingList(
		@Query() query: GetClassroomGameListingListQueryDto,
	): Promise<GetClassroomGameListingListResponseDto> {
		const result = await this.getClassroomGameListingListQuery.execute({
			filterBy: query.filterBy,
			pagination: query.pagination,
		});
		return GetClassroomGameListingListResponseDto.fromQueryResult(result);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a classroom game listing by ID' })
	@ApiParam({ format: 'uuid', name: 'id' })
	@ApiOkResponse({ type: GetClassroomGameListingResponseDto })
	@ApiNotFoundResponse({ description: 'Classroom game listing not found' })
	async getClassroomGameListingById(
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<GetClassroomGameListingResponseDto> {
		const result = await this.getClassroomGameListingQuery.execute({ filterBy: { id } });
		if (!result.classroomGameListing) {
			throw new NotFoundException('Classroom game listing not found');
		}

		return GetClassroomGameListingResponseDto.fromEntity(result.classroomGameListing);
	}

}