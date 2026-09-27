import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsEnum,
	IsIn,
	IsOptional
} from 'class-validator';

import { GetListRequestQueryParamsDto } from '../../../lib/http/request-query.dto';
import type { AdminLicenseStatus } from '../../core/feature/admin/query/get.admin.billing.query';
import { GameAcquisition, GameAcquisitionMechanism } from '../../core/feature/game/model/game.acquisition.entity';
import { GameAcquisitionEvent } from '../../core/feature/game/model/game.acquisition.event.entity';
import { GameLicense } from '../../core/feature/game/model/game.license.entity';
import { GamePaymentAttempt, GamePaymentAttemptStatus } from '../../core/feature/game/model/game.payment.attempt.entity';

export class GetAdminAcquisitionListQueryDto extends GetListRequestQueryParamsDto {

	@ApiPropertyOptional({ enum: GameAcquisitionMechanism, enumName: 'GameAcquisitionMechanism' })
	@IsOptional()
	@IsEnum(GameAcquisitionMechanism)
	mechanism?: GameAcquisitionMechanism;

}

export class GetAdminPaymentAttemptListQueryDto extends GetListRequestQueryParamsDto {

	@ApiPropertyOptional({ enum: GamePaymentAttemptStatus, enumName: 'GamePaymentAttemptStatus' })
	@IsOptional()
	@IsEnum(GamePaymentAttemptStatus)
	status?: GamePaymentAttemptStatus;

}

export class GetAdminLicenseListQueryDto extends GetListRequestQueryParamsDto {

	@ApiPropertyOptional({ enum: ['active', 'scheduled', 'expired'] })
	@IsOptional()
	@IsIn(['active', 'scheduled', 'expired'])
	status?: AdminLicenseStatus;

}

class BillingListItemResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	userEmail!: string;

	@ApiProperty()
	userName!: string;

	@ApiProperty()
	gameTitle!: string;

}

export class AdminAcquisitionListItemResponseDto extends BillingListItemResponseDto {

	@ApiProperty({ type: Object })
	price!: { currency: string; minorUnitAmount: number };

	@ApiProperty({ enum: GameAcquisitionMechanism, enumName: 'GameAcquisitionMechanism' })
	mechanism!: GameAcquisitionMechanism;

	@ApiPropertyOptional({ type: String, format: 'date-time' })
	createdAt?: Date;

	@ApiPropertyOptional({ type: String, format: 'date-time' })
	licenseStartAt?: Date;

	@ApiPropertyOptional({ type: String, format: 'date-time' })
	licenseEndAt?: Date;

	static fromEntity(acquisition: GameAcquisition): AdminAcquisitionListItemResponseDto {
		const userName = [acquisition.user.firstName, acquisition.user.lastName].filter(Boolean).join(' ');
		return {
			createdAt: acquisition.createdAt,
			gameTitle: acquisition.license.gameVariant.gameVersion.game.title,
			id: acquisition.id!,
			licenseEndAt: acquisition.license.endAt,
			licenseStartAt: acquisition.license.startAt,
			mechanism: acquisition.mechanism,
			price: acquisition.price,
			userEmail: acquisition.user.email,
			userName: userName || acquisition.user.email,
		};
	}

}

export class GetAdminAcquisitionListResponseDto {

	@ApiProperty({ type: [AdminAcquisitionListItemResponseDto] })
	acquisitionList!: AdminAcquisitionListItemResponseDto[];

	@ApiProperty({ minimum: 0 })
	totalItemCount!: number;

	static fromQueryResult(result: { acquisitionList: GameAcquisition[]; totalItemCount: number }): GetAdminAcquisitionListResponseDto {
		return { acquisitionList: result.acquisitionList.map(AdminAcquisitionListItemResponseDto.fromEntity), totalItemCount: result.totalItemCount };
	}

}

export class AdminAcquisitionEventResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	eventType!: string;

	@ApiProperty()
	actorType!: string;

	@ApiPropertyOptional()
	actorName?: string;

	@ApiPropertyOptional()
	reason?: string;

	@ApiPropertyOptional()
	providerReference?: string;

	@ApiPropertyOptional()
	correlationId?: string;

	@ApiPropertyOptional({ type: Object })
	metadata?: Record<string, unknown>;

	@ApiProperty({ type: String, format: 'date-time' })
	createdAt!: Date;

	static fromEntity(event: GameAcquisitionEvent): AdminAcquisitionEventResponseDto {
		const actorName = event.actorUser
			? [event.actorUser.firstName, event.actorUser.lastName].filter(Boolean).join(' ')
			: undefined;
		return {
			actorName: actorName || event.actorUser?.email,
			actorType: event.actorType,
			correlationId: event.correlationId,
			createdAt: event.createdAt!,
			eventType: event.eventType,
			id: event.id!,
			metadata: event.metadata,
			providerReference: event.providerReference,
			reason: event.reason,
		};
	}

}

export class GetAdminAcquisitionDetailResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	mechanism!: GameAcquisitionMechanism;

	@ApiProperty({ type: Object })
	price!: { currency: string; minorUnitAmount: number };

	@ApiProperty()
	userName!: string;

	@ApiProperty()
	userEmail!: string;

	@ApiProperty()
	gameTitle!: string;

	@ApiPropertyOptional()
	publisherVersion?: string;

	@ApiPropertyOptional()
	language?: string;

	@ApiPropertyOptional()
	mode?: string;

	@ApiPropertyOptional()
	classroomName?: string;

	@ApiPropertyOptional()
	institutionName?: string;

	@ApiProperty({ type: Object })
	license!: { id: string; startAt: Date; endAt: Date; status: AdminLicenseStatus };

	@ApiPropertyOptional({ type: Object })
	paymentAttempt?: {
		id: string;
		status: GamePaymentAttemptStatus;
		stripeCheckoutSessionId?: string;
		stripePaymentIntentId?: string;
		fulfilledAt?: Date;
	};

	@ApiPropertyOptional({ type: Object })
	codeRedemption?: { id: string; codeId: string; codeMask: string; redeemedAt?: Date; expiresAt: Date };

	@ApiPropertyOptional({ type: String, format: 'date-time' })
	createdAt?: Date;

	@ApiProperty({ type: [AdminAcquisitionEventResponseDto] })
	eventList!: AdminAcquisitionEventResponseDto[];

	static fromQueryResult(
		acquisition: GameAcquisition,
		eventList: GameAcquisitionEvent[],
	): GetAdminAcquisitionDetailResponseDto {
		const userName = [acquisition.user.firstName, acquisition.user.lastName].filter(Boolean).join(' ');
		const gameVariant = acquisition.license.gameVariant;
		const now = new Date();
		const license = acquisition.license;
		const codeRedemption = acquisition.codeRedemption;
		return {
			classroomName: license.classroomGame?.classroom.name,
			codeRedemption: codeRedemption && {
				codeId: codeRedemption.acquisitionCode.id!,
				codeMask: `******-******-**${codeRedemption.acquisitionCode.codeSuffix}`,
				expiresAt: codeRedemption.acquisitionCode.expiresAt,
				id: codeRedemption.id!,
				redeemedAt: codeRedemption.redeemedAt,
			},
			createdAt: acquisition.createdAt,
			eventList: eventList.map(AdminAcquisitionEventResponseDto.fromEntity),
			gameTitle: gameVariant.gameVersion.game.title,
			id: acquisition.id!,
			institutionName: license.classroomGame?.classroom.institution.name,
			language: gameVariant.language,
			license: {
				endAt: license.endAt,
				id: license.id!,
				startAt: license.startAt,
				status: license.startAt > now ? 'scheduled' : license.endAt <= now ? 'expired' : 'active',
			},
			mechanism: acquisition.mechanism,
			mode: gameVariant.mode,
			paymentAttempt: acquisition.paymentAttempt && {
				fulfilledAt: acquisition.paymentAttempt.fulfilledAt,
				id: acquisition.paymentAttempt.id!,
				status: acquisition.paymentAttempt.status,
				stripeCheckoutSessionId: acquisition.paymentAttempt.stripeCheckoutSessionId,
				stripePaymentIntentId: acquisition.paymentAttempt.stripePaymentIntentId,
			},
			price: acquisition.price,
			publisherVersion: gameVariant.gameVersion.publisherVersion,
			userEmail: acquisition.user.email,
			userName: userName || acquisition.user.email,
		};
	}

}

export class AdminPaymentAttemptListItemResponseDto extends BillingListItemResponseDto {

	@ApiProperty({ type: Object })
	price!: { currency: string; minorUnitAmount: number };

	@ApiProperty({ enum: GamePaymentAttemptStatus, enumName: 'GamePaymentAttemptStatus' })
	status!: GamePaymentAttemptStatus;

	@ApiProperty()
	licenseDurationDays!: number;

	@ApiPropertyOptional({ type: String, format: 'date-time' })
	createdAt?: Date;

	@ApiPropertyOptional({ type: String, format: 'date-time' })
	fulfilledAt?: Date;

	static fromEntity(attempt: GamePaymentAttempt): AdminPaymentAttemptListItemResponseDto {
		const userName = [attempt.user.firstName, attempt.user.lastName].filter(Boolean).join(' ');
		const gameTitle = attempt.publicOffer?.gameVariant.gameVersion.game.title
			?? attempt.institutionGameOffer?.gameVariant.gameVersion.game.title
			?? attempt.classroomGame?.institutionGameOffer.gameVariant.gameVersion.game.title
			?? 'Unknown game';
		return {
			createdAt: attempt.createdAt,
			fulfilledAt: attempt.fulfilledAt,
			gameTitle,
			id: attempt.id!,
			licenseDurationDays: attempt.licenseDurationDays,
			price: attempt.price,
			status: attempt.status,
			userEmail: attempt.user.email,
			userName: userName || attempt.user.email,
		};
	}

}

export class GetAdminPaymentAttemptListResponseDto {

	@ApiProperty({ type: [AdminPaymentAttemptListItemResponseDto] })
	paymentAttemptList!: AdminPaymentAttemptListItemResponseDto[];

	@ApiProperty({ minimum: 0 })
	totalItemCount!: number;

	static fromQueryResult(result: { paymentAttemptList: GamePaymentAttempt[]; totalItemCount: number }): GetAdminPaymentAttemptListResponseDto {
		return { paymentAttemptList: result.paymentAttemptList.map(AdminPaymentAttemptListItemResponseDto.fromEntity), totalItemCount: result.totalItemCount };
	}

}

export class AdminLicenseListItemResponseDto extends BillingListItemResponseDto {

	@ApiProperty({ type: String, format: 'date-time' })
	startAt!: Date;

	@ApiProperty({ type: String, format: 'date-time' })
	endAt!: Date;

	@ApiProperty({ enum: ['active', 'scheduled', 'expired'] })
	status!: AdminLicenseStatus;

	@ApiPropertyOptional({ type: String, format: 'date-time' })
	createdAt?: Date;

	static fromEntity(license: GameLicense): AdminLicenseListItemResponseDto {
		const userName = [license.user.firstName, license.user.lastName].filter(Boolean).join(' ');
		const now = new Date();
		const status: AdminLicenseStatus = license.startAt > now ? 'scheduled' : license.endAt <= now ? 'expired' : 'active';
		return {
			createdAt: license.createdAt,
			endAt: license.endAt,
			gameTitle: license.gameVariant.gameVersion.game.title,
			id: license.id!,
			startAt: license.startAt,
			status,
			userEmail: license.user.email,
			userName: userName || license.user.email,
		};
	}

}

export class GetAdminLicenseListResponseDto {

	@ApiProperty({ type: [AdminLicenseListItemResponseDto] })
	licenseList!: AdminLicenseListItemResponseDto[];

	@ApiProperty({ minimum: 0 })
	totalItemCount!: number;

	static fromQueryResult(result: { licenseList: GameLicense[]; totalItemCount: number }): GetAdminLicenseListResponseDto {
		return { licenseList: result.licenseList.map(AdminLicenseListItemResponseDto.fromEntity), totalItemCount: result.totalItemCount };
	}

}