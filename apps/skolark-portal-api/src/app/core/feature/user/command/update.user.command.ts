import { Injectable } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';

import { CommandResult } from '../../../../../lib/entity/command/command.result';
import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { Validator } from '../../../infrastructure/validation/validator/validator';
import { User } from '../model/user.entity';
import { UserRepository } from '../repository/user.repository';

export class UpdateUserCommandData extends StaticFactory {

	@IsString()
	@IsOptional()
	firstName?: string;

	@IsString()
	@IsOptional()
	lastName?: string;

}

export class UpdateUserCommandResult extends CommandResult {

	user?: User;

}

@Injectable()
export class UpdateUserCommand {

	constructor(
		private readonly validator: Validator,
		private readonly userRepository: UserRepository,
	) {
	}

	async execute(userId: string, data: UpdateUserCommandData): Promise<UpdateUserCommandResult> {
		const validationResult = await this.validator.validate(data);

		if (!!validationResult) {
			return UpdateUserCommandResult.fail({ validationResult });
		}

		let user = await this.userRepository.findById(userId);

		if (!user) {
			return UpdateUserCommandResult.fail({ isNotFound: true });
		}

		if (typeof data.firstName !== 'undefined') {
			user.firstName = data.firstName.trim() || undefined;
		}
		if (typeof data.lastName !== 'undefined') {
			user.lastName = data.lastName.trim() || undefined;
		}

		user = await this.userRepository.save(user);

		return UpdateUserCommandResult.success({ user });
	}

}
