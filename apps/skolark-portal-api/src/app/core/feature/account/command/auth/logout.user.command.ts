import { Injectable } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';

import { CommandResult } from '../../../../../../lib/entity/command/command.result';
import { StaticFactory } from '../../../../../../lib/factory/static.factory';
import { Validator } from '../../../../infrastructure/validation/validator/validator';
import { AccountSessionService } from '../../service/account.session.service';

export class LogoutUserCommandData extends StaticFactory {

	@IsOptional()
	@IsString()
	sessionToken?: string;

}

export class LogoutUserCommandResult extends CommandResult {

}

@Injectable()
export class LogoutUserCommand {

	constructor(
		private readonly validator: Validator,
		private readonly accountSessionService: AccountSessionService,
	) {
	}

	async execute(data: LogoutUserCommandData): Promise<LogoutUserCommandResult> {
		const validationResult = await this.validator.validate(data);

		if (!!validationResult) {
			return LogoutUserCommandResult.fail({ validationResult });
		}

		await this.accountSessionService.revoke(data.sessionToken);

		return LogoutUserCommandResult.success();
	}

}
