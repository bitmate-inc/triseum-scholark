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
import { UserRepository } from '../../../user/repository/user.repository';
import { AccountAuthTokenType } from '../../model/account.auth-token.entity';
import { AccountAuthTokenService } from '../../service/account.auth-token.service';

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
		private readonly userRepository: UserRepository,
		private readonly accountAuthTokenService: AccountAuthTokenService,
	) {
	}

	async execute(data: ConfirmEmailAddressCommandData): Promise<ConfirmEmailAddressCommandResult> {
		const validationResult = await this.validator.validate(data);

		if (!!validationResult) {
			return ConfirmEmailAddressCommandResult.fail({ validationResult });
		}

		const token = await this.accountAuthTokenService.findActive(
			data.confirmEmailToken,
			AccountAuthTokenType.EMAIL_VERIFICATION,
		);

		if (!token) {
			return ConfirmEmailAddressCommandResult.fail({ isNotFound: true });
		}

		let user = token.user;

		user.status = data.status || UserStatus.ACTIVE;
		user = await this.userRepository.save(user);
		await this.accountAuthTokenService.consume(token);

		return ConfirmEmailAddressCommandResult.success({ user });
	}

}
