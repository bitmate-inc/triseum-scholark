import {
	Body,
	Controller,
	ForbiddenException,
	Get,
	Header,
	HttpCode,
	HttpStatus,
	NotFoundException,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Put,
	Query,
	UnprocessableEntityException,
	UseGuards,
} from '@nestjs/common';
import {
	ApiCookieAuth,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiTags,
} from '@nestjs/swagger';

import { ChangePasswordCommand, ChangePasswordCommandData } from '../../core/feature/account/command/auth/change.password.command';
import { GetUserLibraryQuery } from '../../core/feature/catalog/query/get.user.library.query';
import { CreateGameLaunchTicketCommand, CreateGameLaunchTicketCommandData } from '../../core/feature/game/command/create.game.launch.ticket.command';
import { GamePaymentAttemptRepository } from '../../core/feature/game/repository/game.payment.attempt.repository';
import { UpdateUserCommand, UpdateUserCommandData } from '../../core/feature/user/command/update.user.command';
import { GetUserQuery, GetUserQueryData } from '../../core/feature/user/query/get.user.query';
import { AuthSession } from '../../core/infrastructure/auth/auth.decorator';
import type { AuthSessionData } from '../../core/infrastructure/auth/model/auth.session.model';
import { MessageResponseDto, UserResponseDto } from '../auth/auth.dto';
import { SessionAuthGuard } from '../auth/session.auth.guard';
import {
	ChangePasswordRequestDto,
	GameCheckoutStatusResponseDto,
	GameLaunchResponseDto,
	UpdateProfileRequestDto,
} from './user.dto';
import { UserLibraryResponseDto } from './user.library.dto';

@ApiTags('Current User')
@ApiCookieAuth()
@UseGuards(SessionAuthGuard)
@Controller('api/v1/user/me')
export class UserController {

	constructor(
		private readonly changePasswordCommand: ChangePasswordCommand,
		private readonly getUserQuery: GetUserQuery,
		private readonly getUserLibraryQuery: GetUserLibraryQuery,
		private readonly gamePaymentAttemptRepository: GamePaymentAttemptRepository,
		private readonly createGameLaunchTicketCommand: CreateGameLaunchTicketCommand,
		private readonly updateUserCommand: UpdateUserCommand,
	) {
	}

	@Get('library')
	@ApiOkResponse({ type: UserLibraryResponseDto })
	async getLibrary(@AuthSession() session: AuthSessionData): Promise<UserLibraryResponseDto> {
		return UserLibraryResponseDto.fromQueryResult(
			await this.getUserLibraryQuery.execute(session.user.id),
		);
	}

	@Post('library/:licenseId/launch')
	@HttpCode(HttpStatus.CREATED)
	@Header('Cache-Control', 'no-store')
	@ApiCreatedResponse({ type: GameLaunchResponseDto })
	async launchGame(
		@AuthSession() session: AuthSessionData,
		@Param('licenseId', ParseUUIDPipe) licenseId: string,
	): Promise<GameLaunchResponseDto> {
		const result = await this.createGameLaunchTicketCommand.execute(
			CreateGameLaunchTicketCommandData.create({ licenseId, userId: session.user.id }),
		);

		if (result.validationResult) {
			throw new UnprocessableEntityException(result.validationResult);
		}

		return {
			gameVersionId: result.license!.gameVariant.gameVersion.id!,
			launchUrl: result.launchUrl!,
			launchTicket: result.launchTicket!,
			licenseId: result.license!.id!,
			validForSeconds: result.validForSeconds!,
		};
	}

	@Get()
	@ApiOkResponse({ type: UserResponseDto })
	async getOwnUser(@AuthSession() session: AuthSessionData): Promise<UserResponseDto> {
		const queryResult = await this.getUserQuery.execute(
			GetUserQueryData.create({ filterBy: { id: session.user.id } }),
		);

		if (!queryResult.user) {
			throw new NotFoundException();
		}

		return UserResponseDto.fromEntity(queryResult.user);
	}

	@Get('checkout-status')
	@ApiOkResponse({ type: GameCheckoutStatusResponseDto })
	async getCheckoutStatus(
		@AuthSession() session: AuthSessionData,
		@Query('checkoutSessionId') checkoutSessionId: string,
	): Promise<GameCheckoutStatusResponseDto> {
		const attempt = await this.gamePaymentAttemptRepository.findByCheckoutSessionIdAndUser(checkoutSessionId, session.user.id);
		if (!attempt) {
			throw new NotFoundException('Checkout session not found');
		}
		return { status: attempt.status };
	}

	@Patch()
	@ApiOkResponse({ type: UserResponseDto })
	async updateProfile(
		@AuthSession() session: AuthSessionData,
		@Body() body: UpdateProfileRequestDto,
	): Promise<UserResponseDto> {
		const commandResult = await this.updateUserCommand.execute(
			session.user.id,
			UpdateUserCommandData.create(body),
		);

		if (!!commandResult.isNotFound) {
			throw new NotFoundException();
		}
		if (!!commandResult.validationResult) {
			throw new UnprocessableEntityException(commandResult.validationResult);
		}

		return UserResponseDto.fromEntity(commandResult.user!);
	}

	@Put('password')
	@ApiOkResponse({ type: MessageResponseDto })
	async changePassword(
		@AuthSession() session: AuthSessionData,
		@Body() body: ChangePasswordRequestDto,
	): Promise<MessageResponseDto> {
		const commandResult = await this.changePasswordCommand.execute(
			session.user.id,
			ChangePasswordCommandData.create({
				currentPassword: body.currentPassword,
				plainPassword: body.password,
			}),
		);

		if (!!commandResult.isNotFound) {
			throw new ForbiddenException();
		}
		if (!!commandResult.validationResult) {
			throw new UnprocessableEntityException(commandResult.validationResult);
		}

		return { message: 'Password updated' };
	}

}