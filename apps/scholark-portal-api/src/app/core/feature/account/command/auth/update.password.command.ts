import { Injectable } from '@nestjs/common';
import {
	IsNotEmpty,
	IsString,
	Length,
} from 'class-validator';

import { CommandResult } from '../../../../../../lib/entity/command/command.result';
import { StaticFactory } from '../../../../../../lib/factory/static.factory';
import { BCryptPasswordEncoder } from '../../../../../../lib/security/encoder/bcrypt.password-encoder';
import { RedisExpressSessionRevoker } from '../../../../infrastructure/auth/transport/express-session/redis.express-session.revoker';
import { Validator } from '../../../../infrastructure/validation/validator/validator';
import { User } from '../../../user/model/user.entity';
import { AccountAuthTokenVerifier } from '../../auth/token/account.auth-token.verifier';
import { AccountAuthTokenType } from '../../model/account.auth-token.entity';
import { AccountIdentityProvider } from '../../model/account.identity.entity';
import { AccountAuthTokenRepository } from '../../repository/account.auth-token.repository';
import { AccountIdentityRepository } from '../../repository/account.identity.repository';

export class UpdatePasswordCommandData extends StaticFactory {

	@IsString()
	@IsNotEmpty()
	passwordResetToken!: string;

	@IsString()
	@Length(8, 128)
	@IsNotEmpty()
	plainPassword!: string;

}

export class UpdatePasswordCommandResult extends CommandResult {

	user?: User;

}

@Injectable()
export class UpdatePasswordCommand {

	constructor(
		private readonly validator: Validator,
		private readonly accountIdentityRepository: AccountIdentityRepository,
		private readonly accountAuthTokenVerifier: AccountAuthTokenVerifier,
		private readonly accountAuthTokenRepository: AccountAuthTokenRepository,
		private readonly sessionRevoker: RedisExpressSessionRevoker,
		private readonly passwordEncoder: BCryptPasswordEncoder,
	) {
	}

	async execute(data: UpdatePasswordCommandData): Promise<UpdatePasswordCommandResult> {
		const validationResult = await this.validator.validate(data);

		if (!!validationResult) {
			return UpdatePasswordCommandResult.fail({ validationResult });
		}

		const token = await this.accountAuthTokenVerifier.findActive({
			type: AccountAuthTokenType.PASSWORD_RESET,
			value: data.passwordResetToken,
		});

		if (!token) {
			return UpdatePasswordCommandResult.fail({ isNotFound: true });
		}

		const { user } = token;
		const identity = await this.accountIdentityRepository.findByUserAndProvider({
			provider: AccountIdentityProvider.LOCAL,
			userId: user.id!,
		});

		if (!identity) {
			return UpdatePasswordCommandResult.fail({ isNotFound: true });
		}

		identity.setPasswordHash(await this.passwordEncoder.encode(data.plainPassword));
		await this.accountIdentityRepository.save(identity);
		token.consume();
		await this.accountAuthTokenRepository.save(token);
		await this.sessionRevoker.revoke(user.id!);

		return UpdatePasswordCommandResult.success({ user });
	}

}
