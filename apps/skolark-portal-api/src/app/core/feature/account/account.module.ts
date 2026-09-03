import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';

import { BCryptPasswordEncoder } from '../../../../lib/security/encoder/bcrypt.password-encoder';
import { User } from '../user/model/user.entity';
import { ChangePasswordCommand } from './command/auth/change.password.command';
import { ConfirmEmailAddressCommand } from './command/auth/confirm.email.address.command';
import { CreateAccountSessionCommand } from './command/auth/create.account-session.command';
import { LogoutUserCommand } from './command/auth/logout.user.command';
import { RegisterUserCommand } from './command/auth/register.user.command';
import { ResetPasswordCommand } from './command/auth/reset.password.command';
import { UpdatePasswordCommand } from './command/auth/update.password.command';
import { VerifyEmailAddressCommand } from './command/auth/verify.email.address.command';
import { SendConfirmEmailAddressEmailCommand } from './command/send-email/send.confirm.email-address.email.command';
import { SendResetPasswordEmailCommand } from './command/send-email/send.reset-password.email.command';
import { AccountAuthToken } from './model/account.auth-token.entity';
import { AccountIdentity } from './model/account.identity.entity';
import { AccountSession } from './model/account.session.entity';
import { GetAuthSessionQuery } from './query/get.auth-session.query';
import { AccountAuthTokenRepository } from './repository/account.auth-token.repository';
import { AccountIdentityRepository } from './repository/account.identity.repository';
import { AccountSessionRepository } from './repository/account.session.repository';
import { AccountAuthTokenService } from './service/account.auth-token.service';
import { AccountIdentityService } from './service/account.identity.service';
import { AccountSessionService } from './service/account.session.service';
import { SessionCookieService } from './service/session.cookie.service';

const commandProviderList = [
	ChangePasswordCommand,
	ConfirmEmailAddressCommand,
	CreateAccountSessionCommand,
	LogoutUserCommand,
	RegisterUserCommand,
	ResetPasswordCommand,
	SendConfirmEmailAddressEmailCommand,
	SendResetPasswordEmailCommand,
	UpdatePasswordCommand,
	VerifyEmailAddressCommand,
];

const providerList = [
	...commandProviderList,
	AccountAuthTokenRepository,
	AccountAuthTokenService,
	AccountIdentityRepository,
	AccountIdentityService,
	AccountSessionRepository,
	AccountSessionService,
	BCryptPasswordEncoder,
	GetAuthSessionQuery,
	SessionCookieService,
];

@Global()
@Module({
	exports: providerList,
	imports: [
		MikroOrmModule.forFeature([
			AccountAuthToken,
			AccountIdentity,
			AccountSession,
			User,
		]),
	],
	providers: providerList,
})
export class AccountModule {}
