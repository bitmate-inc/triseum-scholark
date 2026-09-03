import { Injectable } from '@nestjs/common';
import {
	IsNotEmpty,
	IsString,
	Length,
} from 'class-validator';

import { CommandResult } from '../../../../../../lib/entity/command/command.result';
import { StaticFactory } from '../../../../../../lib/factory/static.factory';
import { BCryptPasswordEncoder } from '../../../../../../lib/security/encoder/bcrypt.password-encoder';
import { ValidationResult } from '../../../../../../lib/validator/model/validation.result';
import { Validator } from '../../../../infrastructure/validation/validator/validator';
import { User } from '../../../user/model/user.entity';
import { UserRepository } from '../../../user/repository/user.repository';
import { AccountIdentityService } from '../../service/account.identity.service';

export class ChangePasswordCommandData extends StaticFactory {

	@IsString()
	@IsNotEmpty()
	currentPassword!: string;

	@IsString()
	@Length(8, 128)
	@IsNotEmpty()
	plainPassword!: string;

}

export class ChangePasswordCommandResult extends CommandResult {

	user?: User;

}

@Injectable()
export class ChangePasswordCommand {

	constructor(
		private readonly validator: Validator,
		private readonly userRepository: UserRepository,
		private readonly accountIdentityService: AccountIdentityService,
		private readonly passwordEncoder: BCryptPasswordEncoder,
	) {
	}

	async execute(userId: string, data: ChangePasswordCommandData): Promise<ChangePasswordCommandResult> {
		const validationResult = await this.validator.validate(data);

		if (!!validationResult) {
			return ChangePasswordCommandResult.fail({ validationResult });
		}

		const user = await this.userRepository.findById(userId);

		if (!user) {
			return ChangePasswordCommandResult.fail({ isNotFound: true });
		}

		const identity = await this.accountIdentityService.findLocalByUser(user);
		const isCurrentPasswordValid = identity?.passwordHash
			? await this.passwordEncoder.isEqual(identity.passwordHash, data.currentPassword)
			: false;

		if (!identity || !isCurrentPasswordValid) {
			return ChangePasswordCommandResult.fail({
				validationResult: ValidationResult.createFromErrorMessage('Current password is incorrect'),
			});
		}

		identity.passwordHash = await this.passwordEncoder.encode(data.plainPassword);
		await this.accountIdentityService.saveIdentity(identity);

		return ChangePasswordCommandResult.success({ user });
	}

}
