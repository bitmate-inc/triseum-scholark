import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IsUUID } from 'class-validator';

import gameProxyConfig from '../../../../../config/game-proxy';
import { CommandResult } from '../../../../../lib/entity/command/command.result';
import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { ValidationResult } from '../../../../../lib/validator/model/validation.result';
import { Validator } from '../../../infrastructure/validation/validator/validator';
import { GameLicense } from '../model/game.license.entity';
import { GameLicenseRepository } from '../repository/game.license.repository';

export class CreateGameLaunchTicketCommandData extends StaticFactory {

	@IsUUID()
	userId!: string;

	@IsUUID()
	licenseId!: string;

}

export class CreateGameLaunchTicketCommandResult extends CommandResult {

	license?: GameLicense;

	launchUrl?: string;

	launchTicket?: string;

	validForSeconds?: number;

	static unavailableFail() {
		return this.fail({
			validationResult: ValidationResult.createFromErrorMessage('Game is unavailable for launch'),
		});
	}

}

@Injectable()
export class CreateGameLaunchTicketCommand {

	constructor(
		private readonly gameLicenseRepository: GameLicenseRepository,
		private readonly jwtService: JwtService,
		private readonly validator: Validator,
		@Inject(gameProxyConfig.KEY) private readonly gameProxy: ConfigType<typeof gameProxyConfig>,
	) {}

	async execute(data: CreateGameLaunchTicketCommandData): Promise<CreateGameLaunchTicketCommandResult> {
		const validationResult = await this.validator.validate(data);
		if (validationResult) {
			return CreateGameLaunchTicketCommandResult.fail({ validationResult });
		}

		const license = await this.gameLicenseRepository.findOwnedById(data.userId, data.licenseId);
		if (!license || !license.isActive() || !license.gameVariant.gameVersion.isPublished()) {
			return CreateGameLaunchTicketCommandResult.unavailableFail();
		}

		if (!this.gameProxy.publicOrigin) {
			return CreateGameLaunchTicketCommandResult.fail({
				validationResult: ValidationResult.createFromErrorMessage('Game launch is not configured'),
			});
		}

		const licenseTtlSeconds = Math.floor((license.endAt.getTime() - Date.now()) / 1000);
		const validForSeconds = Math.min(this.gameProxy.ticketTtlSeconds, licenseTtlSeconds);
		if (validForSeconds <= 0) {
			return CreateGameLaunchTicketCommandResult.unavailableFail();
		}

		const launchTicket = await this.jwtService.signAsync({
			gameVariantId: license.gameVariant.id!,
			gameVersionId: license.gameVariant.gameVersion.id!,
			licenseId: license.id!,
			purpose: 'game_launch',
			sub: data.userId,
		}, {
			audience: 'scholark-game-launch',
			expiresIn: validForSeconds,
			issuer: 'scholark-portal-api',
			jwtid: randomUUID(),
		});
		const launchUrl = new URL('/api/v1/game/launch/exchange', this.gameProxy.publicOrigin);

		return CreateGameLaunchTicketCommandResult.success({
			launchTicket,
			launchUrl: launchUrl.toString(),
			license,
			validForSeconds,
		});
	}

}