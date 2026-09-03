import { Global, Module } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import nodemailer from 'nodemailer';
import type JSONTransport from 'nodemailer/lib/json-transport';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

import nodemailerConfig from '../../../../config/nodemailer';

export function MailerClient(): string {
	return 'MAILER_CLIENT';
}

@Global()
@Module({
	exports: [MailerClient()],
	providers: [
		{
			inject: [nodemailerConfig.KEY],
			provide: MailerClient(),
			useFactory: (config: ConfigType<typeof nodemailerConfig>) => {
				if (config.jsonTransport) {
					return nodemailer.createTransport({ jsonTransport: true } as JSONTransport.Options);
				}

				return nodemailer.createTransport({
					auth: config.auth,
					host: config.host,
					port: config.port,
					secure: config.secure,
				} as SMTPTransport.Options);
			},
		},
	],
})
export class NodemailerModule {}
