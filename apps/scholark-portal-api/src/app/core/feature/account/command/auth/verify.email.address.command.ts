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

export class VerifyEmailAddressCommandData extends StaticFactory {

	@IsString()
	@IsEmail()
	@IsNotEmpty()
	email!: string;

}

export class VerifyEmailAddressCommandResult extends CommandResult {

	token?: string;

	user?: User;

}

@Injectable()
export class VerifyEmailAddressCommand {

	constructor(
		private readonly validator: Validator,
		private readonly userRepository: UserEntityRepository,
		private readonly accountAuthTokenIssuer: AccountAuthTokenIssuer,
	) {
	}

	async execute(data: VerifyEmailAddressCommandData): Promise<VerifyEmailAddressCommandResult> {
		const validationResult = await this.validator.validate(data);

		if (!!validationResult) {
			return VerifyEmailAddressCommandResult.fail({ validationResult });
		}

		const user = await this.userRepository.findOneBy({ email: data.email.trim() });

		if (!user) {
			return VerifyEmailAddressCommandResult.fail({ isNotFound: true });
		}

		const { value: token } = await this.accountAuthTokenIssuer.issue({
			type: AccountAuthTokenType.EMAIL_VERIFICATION,
			user,
		});

		return VerifyEmailAddressCommandResult.success({ token, user });
	}

}
