import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import {
	IsNotEmpty,
	IsString,
	IsUUID,
} from 'class-validator';
import type { Transporter } from 'nodemailer';

import accountConfig from '../../../../../../config/account';
import { CommandResult } from '../../../../../../lib/entity/command/command.result';
import { StaticFactory } from '../../../../../../lib/factory/static.factory';
import { MailerClient } from '../../../../infrastructure/nodemailer/nodemailer.module';
import { Validator } from '../../../../infrastructure/validation/validator/validator';
import { UserRepository } from '../../../user/repository/user.repository';

export class SendResetPasswordEmailCommandData extends StaticFactory {

	@IsNotEmpty()
	@IsUUID()
	userId!: string;

	@IsString()
	@IsNotEmpty()
	token!: string;

}

export class SendResetPasswordEmailCommandResult extends CommandResult {

}

@Injectable()
export class SendResetPasswordEmailCommand {

	constructor(
		@Inject(MailerClient()) private readonly mailer: Transporter,
		@Inject(accountConfig.KEY) private readonly config: ConfigType<typeof accountConfig>,
		private readonly userRepository: UserRepository,
		private readonly validator: Validator,
	) {
	}

	async execute(data: SendResetPasswordEmailCommandData): Promise<SendResetPasswordEmailCommandResult> {
		const validationResult = await this.validator.validate(data);

		if (!!validationResult) {
			return SendResetPasswordEmailCommandResult.fail({ validationResult });
		}

		const user = await this.userRepository.findById(data.userId);

		if (!user) {
			return SendResetPasswordEmailCommandResult.fail({ isNotFound: true });
		}

		const passwordResetUrl = this.config.updatePasswordUrl!.replace(':token', data.token);

		await this.mailer.sendMail({
			from: this.config.resetPasswordEmailFrom,
			subject: this.config.resetPasswordEmailSubject,
			text: `Reset your password: ${passwordResetUrl}`,
			to: user.email,
		});

		return SendResetPasswordEmailCommandResult.success();
	}

}
