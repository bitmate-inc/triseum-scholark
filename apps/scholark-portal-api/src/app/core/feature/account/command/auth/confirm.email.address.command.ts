import { Injectable } from '@nestjs/common';
import {
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
} from 'class-validator';

import { CommandResult } from '../../../../../../lib/entity/command/command.result';
import { StaticFactory } from '../../../../../../lib/factory/static.factory';
import { Validator } from '../../../../infrastructure/validation/validator/validator';
import { User, UserStatus } from '../../../user/model/user.entity';
import { UserEntityRepository } from '../../../user/repository/user.entity.repository';
import { AccountAuthTokenVerifier } from '../../auth/token/account.auth-token.verifier';
import { AccountAuthTokenType } from '../../model/account.auth-token.entity';
import { AccountAuthTokenRepository } from '../../repository/account.auth-token.repository';

export class ConfirmEmailAddressCommandData extends StaticFactory {

	@IsString()
	@IsNotEmpty()
	confirmEmailToken!: string;

	@IsOptional()
	@IsEnum(UserStatus)
	status?: UserStatus;

}

export class ConfirmEmailAddressCommandResult extends CommandResult {

	user?: User;

}

@Injectable()
export class ConfirmEmailAddressCommand {

	constructor(
		private readonly validator: Validator,
		private readonly userRepository: UserEntityRepository,
		private readonly accountAuthTokenVerifier: AccountAuthTokenVerifier,
		private readonly accountAuthTokenRepository: AccountAuthTokenRepository,
	) {
	}

	async execute(data: ConfirmEmailAddressCommandData): Promise<ConfirmEmailAddressCommandResult> {
		const validationResult = await this.validator.validate(data);

		if (!!validationResult) {
			return ConfirmEmailAddressCommandResult.fail({ validationResult });
		}

		const token = await this.accountAuthTokenVerifier.findActive({
			type: AccountAuthTokenType.EMAIL_VERIFICATION,
			value: data.confirmEmailToken,
		});

		if (!token) {
			return ConfirmEmailAddressCommandResult.fail({ isNotFound: true });
		}

		let { user } = token;

		user.status = data.status ?? UserStatus.ACTIVE;
		user = await this.userRepository.save(user);

		token.consume();
		await this.accountAuthTokenRepository.save(token);

		return ConfirmEmailAddressCommandResult.success({ user });
	}

}
