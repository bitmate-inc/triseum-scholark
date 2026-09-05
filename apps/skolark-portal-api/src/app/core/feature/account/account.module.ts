import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';

import { BCryptPasswordEncoder } from '../../../../lib/security/encoder/bcrypt.password-encoder';
import { User } from '../user/model/user.entity';
import { AccountAuthTokenIssuer } from './auth/token/account.auth-token.issuer';
import { AccountAuthTokenVerifier } from './auth/token/account.auth-token.verifier';
import { ChangePasswordCommand } from './command/auth/change.password.command';
import { ConfirmEmailAddressCommand } from './command/auth/confirm.email.address.command';
import { RegisterUserCommand } from './command/auth/register.user.command';
import { ResetPasswordCommand } from './command/auth/reset.password.command';
import { UpdatePasswordCommand } from './command/auth/update.password.command';
import { VerifyEmailAddressCommand } from './command/auth/verify.email.address.command';
import { SendConfirmEmailAddressEmailCommand } from './command/send-email/send.confirm.email-address.email.command';
import { SendResetPasswordEmailCommand } from './command/send-email/send.reset-password.email.command';
import { AccountAuthToken } from './model/account.auth-token.entity';
import { AccountIdentity } from './model/account.identity.entity';
import { AccountAuthTokenRepository } from './repository/account.auth-token.repository';
import { AccountIdentityRepository } from './repository/account.identity.repository';

const repositoryAndServiceProviderList = [
	AccountAuthTokenRepository,
	AccountAuthTokenIssuer,
	AccountAuthTokenVerifier,
	AccountIdentityRepository,
];

const authCommandProviderList = [
	ChangePasswordCommand,
	ConfirmEmailAddressCommand,
	RegisterUserCommand,
	ResetPasswordCommand,
	UpdatePasswordCommand,
	VerifyEmailAddressCommand,
];

const sendEmailCommandProviderList = [
	SendConfirmEmailAddressEmailCommand,
	SendResetPasswordEmailCommand,
];

const providerList = [
	...repositoryAndServiceProviderList,
	...authCommandProviderList,
	...sendEmailCommandProviderList,
	BCryptPasswordEncoder,
];

@Global()
@Module({
	exports: providerList,
	imports: [
		MikroOrmModule.forFeature([
			AccountAuthToken,
			AccountIdentity,
			User,
		]),
	],
	providers: providerList,
})
export class AccountModule {}
