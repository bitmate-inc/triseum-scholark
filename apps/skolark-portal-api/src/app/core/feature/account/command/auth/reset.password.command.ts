import { Injectable } from '@nestjs/common';
import {
	IsEmail,
	IsNotEmpty,
	IsString,
} from 'class-validator';

import { CommandResult } from '../../../../../../lib/entity/command/command.result';
import { StaticFactory } from '../../../../../../lib/factory/static.factory';
import { Validator } from '../../../../infrastructure/validation/validator/validator';
import { User, UserStatus } from '../../../user/model/user.entity';
import { UserRepository } from '../../../user/repository/user.repository';
import { AccountAuthTokenType } from '../../model/account.auth-token.entity';
import { AccountAuthTokenService } from '../../service/account.auth-token.service';

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
		private readonly userRepository: UserRepository,
		private readonly accountAuthTokenService: AccountAuthTokenService,
	) {
	}

	async execute(data: ResetPasswordCommandData): Promise<ResetPasswordCommandResult> {
		const validationResult = await this.validator.validate(data);

		if (!!validationResult) {
			return ResetPasswordCommandResult.fail({ validationResult });
		}

		const user = await this.userRepository.findByEmail(data.email.trim().toLowerCase());

		if (!user || user.status !== UserStatus.ACTIVE) {
			return ResetPasswordCommandResult.fail({ isNotFound: true });
		}

		const token = await this.accountAuthTokenService.issue(
			user,
			AccountAuthTokenType.PASSWORD_RESET,
		);

		return ResetPasswordCommandResult.success({ token, user });
	}

}
