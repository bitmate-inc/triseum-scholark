import { Injectable } from '@nestjs/common';
import {
	IsNotEmpty,
	IsString,
	Length,
} from 'class-validator';

import { CommandResult } from '../../../../../../lib/entity/command/command.result';
import { StaticFactory } from '../../../../../../lib/factory/static.factory';
import { BCryptPasswordEncoder } from '../../../../../../lib/security/encoder/bcrypt.password-encoder';
import { Validator } from '../../../../infrastructure/validation/validator/validator';
import { User } from '../../../user/model/user.entity';
import { AccountAuthTokenType } from '../../model/account.auth-token.entity';
import { AccountAuthTokenService } from '../../service/account.auth-token.service';
import { AccountIdentityService } from '../../service/account.identity.service';
import { AccountSessionService } from '../../service/account.session.service';

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
		private readonly accountIdentityService: AccountIdentityService,
		private readonly accountAuthTokenService: AccountAuthTokenService,
		private readonly accountSessionService: AccountSessionService,
		private readonly passwordEncoder: BCryptPasswordEncoder,
	) {
	}

	async execute(data: UpdatePasswordCommandData): Promise<UpdatePasswordCommandResult> {
		const validationResult = await this.validator.validate(data);

		if (!!validationResult) {
			return UpdatePasswordCommandResult.fail({ validationResult });
		}

		const token = await this.accountAuthTokenService.findActive(
			data.passwordResetToken,
			AccountAuthTokenType.PASSWORD_RESET,
		);

		if (!token) {
			return UpdatePasswordCommandResult.fail({ isNotFound: true });
		}

		const identity = await this.accountIdentityService.findLocalByUser(token.user);

		if (!identity) {
			return UpdatePasswordCommandResult.fail({ isNotFound: true });
		}

		identity.passwordHash = await this.passwordEncoder.encode(data.plainPassword);
		await this.accountIdentityService.saveIdentity(identity);
		await this.accountAuthTokenService.consume(token);
		await this.accountSessionService.revokeForUser(token.user);

		return UpdatePasswordCommandResult.success({ user: token.user });
	}

}
