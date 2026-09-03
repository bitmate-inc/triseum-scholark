import { Inject, Injectable } from '@nestjs/common';
import { IsNotEmpty, IsUUID } from 'class-validator';

import { CommandResult } from '../../../../../../lib/entity/command/command.result';
import { StaticFactory } from '../../../../../../lib/factory/static.factory';
import type {
	SessionBuilder as SessionBuilderContract,
	SessionSerializer as SessionSerializerContract,
} from '../../../../infrastructure/auth/contract/auth.session.contract';
import { SessionBuilder, SessionSerializer } from '../../../../infrastructure/auth/di/auth.token';
import type { AuthSessionData } from '../../../../infrastructure/auth/model/auth.session.model';
import { Validator } from '../../../../infrastructure/validation/validator/validator';
import { User } from '../../../user/model/user.entity';
import { UserRepository } from '../../../user/repository/user.repository';

export class CreateAccountSessionCommandData extends StaticFactory {

	@IsNotEmpty()
	@IsUUID()
	userId!: string;

}

export class CreateAccountSessionCommandResult extends CommandResult {

	sessionToken?: string;

	user?: User;

}

@Injectable()
export class CreateAccountSessionCommand {

	constructor(
		private readonly validator: Validator,
		private readonly userRepository: UserRepository,
		@Inject(SessionBuilder())
		private readonly sessionBuilder: SessionBuilderContract<User, AuthSessionData>,
		@Inject(SessionSerializer('opaque'))
		private readonly sessionSerializer: SessionSerializerContract<AuthSessionData, string>,
	) {
	}

	async execute(data: CreateAccountSessionCommandData): Promise<CreateAccountSessionCommandResult> {
		const validationResult = await this.validator.validate(data);

		if (!!validationResult) {
			return CreateAccountSessionCommandResult.fail({ validationResult });
		}

		const user = await this.userRepository.findById(data.userId);

		if (!user) {
			return CreateAccountSessionCommandResult.fail({ isNotFound: true });
		}

		const session = await this.sessionBuilder.build(user);
		const sessionToken = await this.sessionSerializer.serialize(session);

		return CreateAccountSessionCommandResult.success({ sessionToken, user });
	}

}
