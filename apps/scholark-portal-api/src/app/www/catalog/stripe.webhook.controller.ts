import {
	Controller,
	Headers,
	HttpCode,
	Post,
	Req,
} from '@nestjs/common';
import type { Request } from 'express';

import { ProcessGamePaymentWebhookCommand } from '../../core/feature/game/command/process.game.payment.webhook.command';

type RawBodyRequest = Request & { rawBody?: Buffer };

@Controller('api/v1/stripe')
export class StripeWebhookController {

	constructor(private readonly processGamePaymentWebhookCommand: ProcessGamePaymentWebhookCommand) {}

	@Post('webhook')
	@HttpCode(200)
	async processWebhook(
		@Req() request: RawBodyRequest,
		@Headers('stripe-signature') signature?: string,
	): Promise<void> {
		await this.processGamePaymentWebhookCommand.execute(request.rawBody ?? Buffer.from(''), signature ?? '');
	}

}