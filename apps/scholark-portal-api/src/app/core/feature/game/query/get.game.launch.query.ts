import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IsUUID } from 'class-validator';

import { CommandResult } from '../../../../../lib/entity/command/command.result';
import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { ValidationResult } from '../../../../../lib/validator/model/validation.result';
import { Validator } from '../../../infrastructure/validation/validator/validator';
import { GameLicense } from '../model/game.license.entity';
import { GameLicenseRepository } from '../repository/game.license.repository';

export class GetGameLaunchQueryData extends StaticFactory {

	@IsUUID()
	userId!: string;

	@IsUUID()
	licenseId!: string;

}

export class GetGameLaunchQueryResult extends CommandResult {

	license?: GameLicense;

	launchUrl?: string;

	static unavailableFail() {
		return this.fail({
			validationResult: ValidationResult.createFromErrorMessage('Game is unavailable for launch'),
		});
	}

}

@Injectable()
export class GetGameLaunchQuery {

	constructor(
		private readonly gameLicenseRepository: GameLicenseRepository,
		private readonly jwtService: JwtService,
		private readonly validator: Validator,
	) {}

	async execute(data: GetGameLaunchQueryData): Promise<GetGameLaunchQueryResult> {
		const validationResult = await this.validator.validate(data);
		if (validationResult) {
			return GetGameLaunchQueryResult.fail({ validationResult });
		}

		const license = await this.gameLicenseRepository.findOwnedById(data.userId, data.licenseId);
		if (!license || !license.isActive() || !license.gameVariant.gameVersion.isPublished()) {
			return GetGameLaunchQueryResult.unavailableFail();
		}

		const launchToken = await this.jwtService.signAsync({
			gameVariantId: license.gameVariant.id!,
			gameVersionId: license.gameVariant.gameVersion.id!,
			licenseId: license.id!,
			sub: data.userId,
		}, {
			expiresIn: Math.max(1, Math.min(60, Math.floor((license.endAt.getTime() - Date.now()) / 1000))),
		});
		const launchUrl = new URL(license.gameVariant.gameVersion.runUrl);
		launchUrl.searchParams.set('launch_token', launchToken);

		return GetGameLaunchQueryResult.success({
			launchUrl: launchUrl.toString(),
			license,
		});
	}

}