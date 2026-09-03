import { Injectable } from '@nestjs/common';
import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	Length,
} from 'class-validator';

import { CommandResult } from '../../../../../../lib/entity/command/command.result';
import { StaticFactory } from '../../../../../../lib/factory/static.factory';
import { BCryptPasswordEncoder } from '../../../../../../lib/security/encoder/bcrypt.password-encoder';
import { ValidationResult } from '../../../../../../lib/validator/model/validation.result';
import { Validator } from '../../../../infrastructure/validation/validator/validator';
import { User, UserStatus } from '../../../user/model/user.entity';
import { UserRepository } from '../../../user/repository/user.repository';
import { AccountIdentity } from '../../model/account.identity.entity';
import { AccountIdentityService } from '../../service/account.identity.service';

export class RegisterUserCommandData extends StaticFactory {

	@IsEmail()
	@IsNotEmpty()
	email!: string;

	@IsString()
	@Length(8, 128)
	@IsNotEmpty()
	plainPassword!: string;

	@IsString()
	@IsOptional()
	firstName?: string;

	@IsString()
	@IsOptional()
	lastName?: string;

}

export class RegisterUserCommandResult extends CommandResult {

	user?: User;

	static userExistsFail(user: User) {
		return this.fail({
			validationResult: ValidationResult.createFromErrorMessage(
				`User with email "${user.email}" already exists`,
			),
		});
	}

}

@Injectable()
export class RegisterUserCommand {

	constructor(
		private readonly validator: Validator,
		private readonly userRepository: UserRepository,
		private readonly accountIdentityService: AccountIdentityService,
		private readonly passwordEncoder: BCryptPasswordEncoder,
	) {
	}

	async execute(data: RegisterUserCommandData): Promise<RegisterUserCommandResult> {
		const validationResult = await this.validator.validate(data);

		if (!!validationResult) {
			return RegisterUserCommandResult.fail({ validationResult });
		}

		const email = data.email.trim().toLowerCase();
		const existingUser = await this.userRepository.findByEmail(email);

		if (!!existingUser) {
			return RegisterUserCommandResult.userExistsFail(existingUser);
		}

		let user = new User();

		user.email = email;
		user.firstName = data.firstName?.trim() || undefined;
		user.lastName = data.lastName?.trim() || undefined;
		user.status = UserStatus.PENDING;
		user = await this.userRepository.save(user);

		const passwordHash = await this.passwordEncoder.encode(data.plainPassword);

		await this.accountIdentityService.saveIdentity(
			AccountIdentity.createLocal(user, email, passwordHash),
		);

		return RegisterUserCommandResult.success({ user });
	}

}
