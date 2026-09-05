import { Injectable } from '@nestjs/common';
import {
	IsEmail,
	IsNotEmpty,
	IsString,
} from 'class-validator';

import { CommandResult } from '../../../../../../lib/entity/command/command.result';
import { StaticFactory } from '../../../../../../lib/factory/static.factory';
import { Validator } from '../../../../infrastructure/validation/validator/validator';
import { User } from '../../../user/model/user.entity';
import { UserEntityRepository } from '../../../user/repository/user.entity.repository';
import { AccountAuthTokenIssuer } from '../../auth/token/account.auth-token.issuer';
import { AccountAuthTokenType } from '../../model/account.auth-token.entity';

export class ResetPasswordCommandData extends StaticFactory {

	@IsString()
	@IsEmail()
	@IsNotEmpty()
	email!: string;

}

export class ResetPasswordCommandResult extends CommandResult {

	token?: string;

	user?: User;

}

@Injectable()
export class ResetPasswordCommand {

	constructor(
		private readonly validator: Validator,
		private readonly userRepository: UserEntityRepository,
		private readonly accountAuthTokenIssuer: AccountAuthTokenIssuer,
	) {
	}

	async execute(data: ResetPasswordCommandData): Promise<ResetPasswordCommandResult> {
		const validationResult = await this.validator.validate(data);

		if (!!validationResult) {
			return ResetPasswordCommandResult.fail({ validationResult });
		}

		const user = await this.userRepository.findOneBy({ email: data.email.trim() });

		if (!user?.isActive()) {
			return ResetPasswordCommandResult.fail({ isNotFound: true });
		}

		const { value: token } = await this.accountAuthTokenIssuer.issue({
			type: AccountAuthTokenType.PASSWORD_RESET,
			user,
		});

		return ResetPasswordCommandResult.success({ token, user });
	}

}
