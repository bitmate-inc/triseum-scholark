import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	Res,
	UnprocessableEntityException,
	UseGuards,
} from '@nestjs/common';
import {
	ApiConflictResponse,
	ApiCookieAuth,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { ConfirmEmailAddressCommand, ConfirmEmailAddressCommandData } from '../../core/feature/account/command/auth/confirm.email.address.command';
import { CreateAccountSessionCommand, CreateAccountSessionCommandData } from '../../core/feature/account/command/auth/create.account-session.command';
import { LogoutUserCommand, LogoutUserCommandData } from '../../core/feature/account/command/auth/logout.user.command';
import { RegisterUserCommand, RegisterUserCommandData } from '../../core/feature/account/command/auth/register.user.command';
import { ResetPasswordCommand, ResetPasswordCommandData } from '../../core/feature/account/command/auth/reset.password.command';
import { UpdatePasswordCommand, UpdatePasswordCommandData } from '../../core/feature/account/command/auth/update.password.command';
import { VerifyEmailAddressCommand, VerifyEmailAddressCommandData } from '../../core/feature/account/command/auth/verify.email.address.command';
import {
	SendConfirmEmailAddressEmailCommand,
	SendConfirmEmailAddressEmailCommandData
} from '../../core/feature/account/command/send-email/send.confirm.email-address.email.command';
import {
	SendResetPasswordEmailCommand,
	SendResetPasswordEmailCommandData
} from '../../core/feature/account/command/send-email/send.reset-password.email.command';
import { GetAuthSessionQuery, GetAuthSessionQueryData } from '../../core/feature/account/query/get.auth-session.query';
import { SessionCookieService } from '../../core/feature/account/service/session.cookie.service';
import { UserStatus } from '../../core/feature/user/model/user.entity';
import {
	EmailRequestDto,
	LoginRequestDto,
	MessageResponseDto,
	RegisterRequestDto,
	ResetPasswordRequestDto,
	TokenRequestDto,
	UserResponseDto,
} from './auth.dto';
import { LoginAuthGuard } from './login.auth.guard';
import type { AuthenticatedRequest } from './session.auth.guard';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {

	constructor(
		private readonly confirmEmailAddressCommand: ConfirmEmailAddressCommand,
		private readonly createAccountSessionCommand: CreateAccountSessionCommand,
		private readonly getAuthSessionQuery: GetAuthSessionQuery,
		private readonly logoutUserCommand: LogoutUserCommand,
		private readonly registerUserCommand: RegisterUserCommand,
		private readonly resetPasswordCommand: ResetPasswordCommand,
		private readonly sendConfirmEmailAddressEmailCommand: SendConfirmEmailAddressEmailCommand,
		private readonly sendResetPasswordEmailCommand: SendResetPasswordEmailCommand,
		private readonly sessionCookieService: SessionCookieService,
		private readonly updatePasswordCommand: UpdatePasswordCommand,
		private readonly verifyEmailAddressCommand: VerifyEmailAddressCommand,
	) {
	}

	@Get('session')
	@ApiOperation({ summary: 'Get the current browser session user' })
	@ApiOkResponse({ type: UserResponseDto })
	async getSession(@Req() request: Request): Promise<UserResponseDto | null> {
		const queryResult = await this.getAuthSessionQuery.execute(
			GetAuthSessionQueryData.create({
				sessionToken: this.sessionCookieService.read(request),
			}),
		);

		return queryResult.user ? UserResponseDto.fromEntity(queryResult.user) : null;
	}

	@Post('register')
	@ApiOperation({ summary: 'Register a local user account' })
	@ApiCreatedResponse({ type: MessageResponseDto })
	@ApiConflictResponse({ description: 'Email already registered' })
	async register(@Body() body: RegisterRequestDto): Promise<MessageResponseDto> {
		const commandResult = await this.registerUserCommand.execute(
			RegisterUserCommandData.create({
				email: body.email,
				firstName: body.firstName,
				lastName: body.lastName,
				plainPassword: body.password,
			}),
		);

		if (!!commandResult.validationResult) {
			throw new UnprocessableEntityException(commandResult.validationResult);
		}

		await this.verifyAndSendConfirmationEmail(commandResult.user!.email);

		return { message: 'Check your email to confirm your account' };
	}

	@Post('login')
	@ApiOperation({ summary: 'Log in with email and password' })
	@ApiOkResponse({ type: UserResponseDto })
	@ApiUnauthorizedResponse({ description: 'Invalid credentials' })
	@HttpCode(HttpStatus.OK)
	@UseGuards(LoginAuthGuard)
	async login(
		@Body() _body: LoginRequestDto,
		@Req() request: AuthenticatedRequest,
		@Res({ passthrough: true }) response: Response,
	): Promise<UserResponseDto> {
		const result = await this.createAccountSessionCommand.execute(
			CreateAccountSessionCommandData.create({ userId: request.user.id! }),
		);

		this.throwOnCommandFailure(result);
		this.sessionCookieService.set(response, result.sessionToken!);

		return UserResponseDto.fromEntity(result.user!);
	}

	@Post('logout')
	@ApiCookieAuth()
	@ApiOkResponse({ type: MessageResponseDto })
	@HttpCode(HttpStatus.OK)
	async logout(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	): Promise<MessageResponseDto> {
		const commandResult = await this.logoutUserCommand.execute(
			LogoutUserCommandData.create({
				sessionToken: this.sessionCookieService.read(request),
			}),
		);

		this.throwOnCommandFailure(commandResult);
		this.sessionCookieService.clear(response);

		return { message: 'Logged out' };
	}

	@Post('email/verification')
	@ApiOkResponse({ type: MessageResponseDto })
	@HttpCode(HttpStatus.OK)
	async resendVerification(
		@Body() body: EmailRequestDto
	): Promise<MessageResponseDto> {
		await this.verifyAndSendConfirmationEmail(body.email);

		return { message: 'If the account requires verification, an email has been sent' };
	}

	@Post('email/confirmation')
	@ApiOkResponse({ type: MessageResponseDto })
	@HttpCode(HttpStatus.OK)
	async confirmEmail(
		@Body() body: TokenRequestDto
	): Promise<MessageResponseDto> {
		const commandResult = await this.confirmEmailAddressCommand.execute(
			ConfirmEmailAddressCommandData.create({
				confirmEmailToken: body.token,
				status: UserStatus.ACTIVE,
			}),
		);

		this.throwOnCommandFailure(commandResult);

		return { message: 'Email address confirmed' };
	}

	@Post('password/reset')
	@ApiOkResponse({ type: MessageResponseDto })
	@HttpCode(HttpStatus.OK)
	async requestPasswordReset(
		@Body() body: EmailRequestDto
	): Promise<MessageResponseDto> {
		const commandResult = await this.resetPasswordCommand.execute(
			ResetPasswordCommandData.create({ email: body.email }),
		);

		if (commandResult.isSuccess()) {
			const emailResult = await this.sendResetPasswordEmailCommand.execute(
				SendResetPasswordEmailCommandData.create({
					token: commandResult.token!,
					userId: commandResult.user!.id!,
				}),
			);

			this.throwOnCommandFailure(emailResult);
		}
		if (!!commandResult.validationResult) {
			throw new UnprocessableEntityException(commandResult.validationResult);
		}

		return { message: 'If the account exists, a password reset email has been sent' };
	}

	@Post('password/reset/confirmation')
	@ApiOkResponse({ type: MessageResponseDto })
	@HttpCode(HttpStatus.OK)
	async resetPassword(
		@Body() body: ResetPasswordRequestDto
	): Promise<MessageResponseDto> {
		const commandResult = await this.updatePasswordCommand.execute(
			UpdatePasswordCommandData.create({
				passwordResetToken: body.token,
				plainPassword: body.password,
			}),
		);

		this.throwOnCommandFailure(commandResult);

		return { message: 'Password updated' };
	}

	private async verifyAndSendConfirmationEmail(email: string): Promise<void> {
		const commandResult = await this.verifyEmailAddressCommand.execute(
			VerifyEmailAddressCommandData.create({ email }),
		);

		if (commandResult.isSuccess()) {
			const emailResult = await this.sendConfirmEmailAddressEmailCommand.execute(
				SendConfirmEmailAddressEmailCommandData.create({
					token: commandResult.token!,
					userId: commandResult.user!.id!,
				}),
			);

			this.throwOnCommandFailure(emailResult);
		}
		if (!!commandResult.validationResult) {
			throw new UnprocessableEntityException(commandResult.validationResult);
		}
	}

	private throwOnCommandFailure(result: {
		isNotFound?: boolean;
		validationResult?: unknown;
	}): void {
		if (!!result.isNotFound) {
			throw new BadRequestException();
		}
		if (!!result.validationResult) {
			throw new UnprocessableEntityException(result.validationResult);
		}
	}

}