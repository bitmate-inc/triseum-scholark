import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

import { GetListRequestQueryParamsDto } from '../../../lib/http/request-query.dto';
import {
	type GetAdminAcquisitionCodeListQueryData,
	GetAdminAcquisitionCodeListQueryResult,
} from '../../core/feature/admin/query/get.admin.acquisition.code.list.query';
import { AcquisitionCode } from '../../core/feature/education/model/acquisition.code.entity';
import { AcquisitionCodeRedemption } from '../../core/feature/education/model/acquisition.code.redemption.entity';
import { GameAcquisitionEvent } from '../../core/feature/game/model/game.acquisition.event.entity';
import { AdminAcquisitionEventResponseDto } from './admin.billing.dto';

export class GetAdminAcquisitionCodeListQueryDto extends GetListRequestQueryParamsDto {

	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	institutionId?: string;

	get adminFilterBy(): GetAdminAcquisitionCodeListQueryData['filterBy'] {
		return { ...this.filterBy, institutionId: this.institutionId };
	}

}

export class AdminAcquisitionCodeRedemptionResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	userName!: string;

	@ApiProperty()
	userEmail!: string;

	@ApiPropertyOptional({ type: String, format: 'date-time' })
	redeemedAt?: Date;

	static fromEntity(redemption: AcquisitionCodeRedemption): AdminAcquisitionCodeRedemptionResponseDto {
		const userName = [redemption.redeemedBy.firstName, redemption.redeemedBy.lastName].filter(Boolean).join(' ');
		return {
			id: redemption.id!,
			redeemedAt: redemption.redeemedAt,
			userEmail: redemption.redeemedBy.email,
			userName: userName || redemption.redeemedBy.email,
		};
	}

}

export class AdminAcquisitionCodeListItemResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	code!: string;

	@ApiProperty({ enum: ['active', 'expired', 'revoked'] })
	status!: 'active' | 'expired' | 'revoked';

	@ApiProperty({ type: String, format: 'date-time' })
	expiresAt!: Date;

	@ApiPropertyOptional({ type: String, format: 'date-time' })
	createdAt?: Date;

	@ApiPropertyOptional({ type: String, format: 'date-time' })
	revokedAt?: Date;

	@ApiPropertyOptional()
	classroomId?: string;

	@ApiPropertyOptional()
	classroomName?: string;

	@ApiPropertyOptional()
	institutionId?: string;

	@ApiPropertyOptional()
	institutionName?: string;

	@ApiPropertyOptional()
	gameTitle?: string;

	@ApiPropertyOptional()
	publisherVersion?: string;

	@ApiPropertyOptional()
	language?: string;

	@ApiPropertyOptional()
	mode?: string;

	@ApiPropertyOptional()
	designatedPayor?: string;

	@ApiPropertyOptional()
	licenseDurationDays?: number;

	@ApiPropertyOptional({ type: Object })
	price?: { currency: string; minorUnitAmount: number };

	@ApiProperty({ type: [AdminAcquisitionCodeRedemptionResponseDto] })
	redemptionList!: AdminAcquisitionCodeRedemptionResponseDto[];

	@ApiProperty({ type: [AdminAcquisitionEventResponseDto] })
	eventList!: AdminAcquisitionEventResponseDto[];

	static fromEntity(
		code: AcquisitionCode,
		redemptionList: AcquisitionCodeRedemption[],
		eventList: GameAcquisitionEvent[] = [],
	): AdminAcquisitionCodeListItemResponseDto {
		const classroomGame = code.classroomGame;
		const offer = classroomGame?.institutionGameOffer;
		const variant = offer?.gameVariant;
		const now = new Date();
		const status = code.revokedAt ? 'revoked' : code.expiresAt <= now ? 'expired' : 'active';
		return {
			code: `******-******-**${code.codeSuffix}`,
			classroomId: classroomGame?.classroom.id,
			classroomName: classroomGame?.classroom.name,
			createdAt: code.createdAt,
			designatedPayor: offer?.designatedPayor,
			expiresAt: code.expiresAt,
			gameTitle: variant?.gameVersion.game.title,
			id: code.id!,
			institutionId: classroomGame?.classroom.institution.id,
			institutionName: classroomGame?.classroom.institution.name,
			language: variant?.language,
			licenseDurationDays: offer?.licenseDurationDays,
			mode: variant?.mode,
			price: offer?.price,
			publisherVersion: variant?.gameVersion.publisherVersion,
			redemptionList: redemptionList.map(AdminAcquisitionCodeRedemptionResponseDto.fromEntity),
			eventList: eventList.map(AdminAcquisitionEventResponseDto.fromEntity),
			revokedAt: code.revokedAt,
			status,
		};
	}

}

export class GetAdminAcquisitionCodeListResponseDto {

	@ApiProperty({ type: [AdminAcquisitionCodeListItemResponseDto] })
	acquisitionCodeList!: AdminAcquisitionCodeListItemResponseDto[];

	@ApiProperty({ minimum: 0 })
	totalItemCount!: number;

	static fromQueryResult(result: GetAdminAcquisitionCodeListQueryResult): GetAdminAcquisitionCodeListResponseDto {
		return {
			acquisitionCodeList: result.acquisitionCodeList.map((code) =>
				AdminAcquisitionCodeListItemResponseDto.fromEntity(
					code,
					result.redemptionListByCodeId.get(code.id!) ?? [],
					result.eventListByCodeId.get(code.id!) ?? [],
				),
			),
			totalItemCount: result.totalItemCount,
		};
	}

}

export class CreateAdminAcquisitionCodesResponseDto {

	@ApiProperty({ type: [String] })
	codeList!: string[];

}