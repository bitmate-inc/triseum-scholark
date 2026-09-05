import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	NotFoundException,
	Post,
	Req,
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
import type { Request } from 'express';

import { ConfirmEmailAddressCommand, ConfirmEmailAddressCommandData } from '../../core/feature/account/command/auth/confirm.email.address.command';
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
import { UserStatus } from '../../core/feature/user/model/user.entity';
import { GetUserQuery, GetUserQueryData } from '../../core/feature/user/query/get.user.query';
import { AuthSession } from '../../core/infrastructure/auth/auth.decorator';
import type { AuthSessionData } from '../../core/infrastructure/auth/model/auth.session.model';
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

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {

	constructor(
		private readonly confirmEmailAddressCommand: ConfirmEmailAddressCommand,
		private readonly registerUserCommand: RegisterUserCommand,
		private readonly resetPasswordCommand: ResetPasswordCommand,
		private readonly sendConfirmEmailAddressEmailCommand: SendConfirmEmailAddressEmailCommand,
		private readonly sendResetPasswordEmailCommand: SendResetPasswordEmailCommand,
		private readonly updatePasswordCommand: UpdatePasswordCommand,
		private readonly verifyEmailAddressCommand: VerifyEmailAddressCommand,
		private readonly getUserQuery: GetUserQuery,
	) {
	}

	@Get('session')
	@ApiOperation({ summary: 'Get the current browser session user' })
	@ApiOkResponse({ type: UserResponseDto })
	async getSession(@AuthSession() session?: AuthSessionData): Promise<UserResponseDto | null> {
		if (!session) {
			return null;
		}

		return this.getUserResponse(session.user.id);
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
		@AuthSession() session: AuthSessionData,
		@Req() request: Request,
	): Promise<UserResponseDto> {
		await new Promise<void>((resolve, reject) => {
			request.logIn(session, (error: unknown) => error ? reject(error) : resolve());
		});

		return this.getUserResponse(session.user.id);
	}

	@Post('logout')
	@ApiCookieAuth()
	@ApiOkResponse({ type: MessageResponseDto })
	@HttpCode(HttpStatus.OK)
	async logout(@Req() request: Request): Promise<MessageResponseDto> {
		await new Promise<void>((resolve, reject) => {
			request.logout(error => error ? reject(error) : resolve());
		});
		await new Promise<void>((resolve, reject) => {
			request.session.destroy(error => error ? reject(error) : resolve());
		});

		return { message: 'Logged out' };
	}

	private async getUserResponse(userId: string): Promise<UserResponseDto> {
		const queryResult = await this.getUserQuery.execute(
			GetUserQueryData.create({ filterBy: { id: userId } }),
		);

		if (!queryResult.user) {
			throw new NotFoundException();
		}

		return UserResponseDto.fromEntity(queryResult.user);
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