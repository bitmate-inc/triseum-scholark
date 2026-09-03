import {
	Body,
	Controller,
	ForbiddenException,
	Get,
	NotFoundException,
	Patch,
	Put,
	Req,
	UnprocessableEntityException,
	UseGuards
} from '@nestjs/common';
import {
	ApiCookieAuth,
	ApiOkResponse,
	ApiTags
} from '@nestjs/swagger';

import { ChangePasswordCommand, ChangePasswordCommandData } from '../../core/feature/account/command/auth/change.password.command';
import { UpdateUserCommand, UpdateUserCommandData } from '../../core/feature/user/command/update.user.command';
import { GetUserQuery, GetUserQueryData } from '../../core/feature/user/query/get.user.query';
import { MessageResponseDto, UserResponseDto } from '../auth/auth.dto';
import type { AuthenticatedRequest } from '../auth/session.auth.guard';
import { SessionAuthGuard } from '../auth/session.auth.guard';
import { ChangePasswordRequestDto, UpdateProfileRequestDto } from './user.dto';

@ApiTags('Current User')
@ApiCookieAuth()
@UseGuards(SessionAuthGuard)
@Controller('api/v1/user/me')
export class UserController {

	constructor(
		private readonly changePasswordCommand: ChangePasswordCommand,
		private readonly getUserQuery: GetUserQuery,
		private readonly updateUserCommand: UpdateUserCommand,
	) {
	}

	@Get()
	@ApiOkResponse({ type: UserResponseDto })
	async getOwnUser(@Req() request: AuthenticatedRequest): Promise<UserResponseDto> {
		const queryResult = await this.getUserQuery.execute(
			GetUserQueryData.create({ filterBy: { id: request.user.id! } }),
		);

		if (!queryResult.user) {
			throw new NotFoundException();
		}

		return UserResponseDto.fromEntity(queryResult.user);
	}

	@Patch()
	@ApiOkResponse({ type: UserResponseDto })
	async updateProfile(
		@Req() request: AuthenticatedRequest,
		@Body() body: UpdateProfileRequestDto,
	): Promise<UserResponseDto> {
		const commandResult = await this.updateUserCommand.execute(
			request.user.id!,
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
		@Req() request: AuthenticatedRequest,
		@Body() body: ChangePasswordRequestDto,
	): Promise<MessageResponseDto> {
		const commandResult = await this.changePasswordCommand.execute(
			request.user.id!,
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