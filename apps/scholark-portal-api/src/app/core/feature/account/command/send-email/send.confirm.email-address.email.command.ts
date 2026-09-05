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
import { UserEntityRepository } from '../../../user/repository/user.entity.repository';

export class SendConfirmEmailAddressEmailCommandData extends StaticFactory {

	@IsNotEmpty()
	@IsUUID()
	userId!: string;

	@IsString()
	@IsNotEmpty()
	token!: string;

}

export class SendConfirmEmailAddressEmailCommandResult extends CommandResult {

}

@Injectable()
export class SendConfirmEmailAddressEmailCommand {

	constructor(
		@Inject(MailerClient()) private readonly mailer: Transporter,
		@Inject(accountConfig.KEY) private readonly config: ConfigType<typeof accountConfig>,
		private readonly userRepository: UserEntityRepository,
		private readonly validator: Validator,
	) {
	}

	async execute(data: SendConfirmEmailAddressEmailCommandData): Promise<SendConfirmEmailAddressEmailCommandResult> {
		const validationResult = await this.validator.validate(data);

		if (!!validationResult) {
			return SendConfirmEmailAddressEmailCommandResult.fail({ validationResult });
		}

		const user = await this.userRepository.findOneBy({ id: data.userId });

		if (!user) {
			return SendConfirmEmailAddressEmailCommandResult.fail({ isNotFound: true });
		}

		const confirmEmailUrl = this.config.confirmEmailUrl!.replace(':token', data.token);

		await this.mailer.sendMail({
			from: this.config.confirmEmailFrom,
			subject: this.config.confirmEmailSubject,
			text: `Confirm your email address: ${confirmEmailUrl}`,
			to: user.email,
		});

		return SendConfirmEmailAddressEmailCommandResult.success();
	}

}
