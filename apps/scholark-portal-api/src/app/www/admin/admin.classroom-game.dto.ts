import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

import { GetListRequestQueryParamsDto } from '../../../lib/http/request-query.dto';
import type { GetAdminClassroomGameListQueryData } from '../../core/feature/admin/query/get.admin.classroom.game.query';
import { ClassroomGame } from '../../core/feature/education/model/classroom.game.entity';
import { InstitutionGameOfferDesignatedPayor } from '../../core/feature/education/model/institution.game.offer.entity';
import { MoneyDto } from '../catalog/game.dto';

export class GetAdminClassroomGameListQueryDto extends GetListRequestQueryParamsDto {

	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	institutionId?: string;

	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	classroomId?: string;

	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	gameId?: string;

	get adminFilterBy(): GetAdminClassroomGameListQueryData['filterBy'] {
		return {
			classroomId: this.classroomId,
			gameId: this.gameId,
			institutionId: this.institutionId,
			q: this.q,
		};
	}

}

class AdminClassroomGameInstitutionResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

}

class AdminClassroomGamePublisherResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

}

export class AdminClassroomGameResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ type: () => AdminClassroomGameInstitutionResponseDto })
	institution!: AdminClassroomGameInstitutionResponseDto;

	@ApiProperty({ format: 'uuid' })
	classroomId!: string;

	@ApiProperty()
	classroomName!: string;

	@ApiProperty()
	classroomSlug!: string;

	@ApiProperty({ format: 'uuid' })
	gameId!: string;

	@ApiProperty()
	gameTitle!: string;

	@ApiProperty()
	gameSlug!: string;

	@ApiProperty({ type: () => AdminClassroomGamePublisherResponseDto })
	publisher!: AdminClassroomGamePublisherResponseDto;

	@ApiProperty({ format: 'uuid' })
	gameVersionId!: string;

	@ApiProperty()
	publisherVersion!: string;

	@ApiProperty({ format: 'uuid' })
	institutionGameOfferId!: string;

	@ApiProperty({ enum: InstitutionGameOfferDesignatedPayor, enumName: 'InstitutionGameOfferDesignatedPayor' })
	designatedPayor!: InstitutionGameOfferDesignatedPayor;

	@ApiProperty({ type: MoneyDto })
	price!: MoneyDto;

	@ApiProperty()
	licenseDurationDays!: number;

	@ApiProperty()
	language!: string;

	@ApiProperty()
	mode!: string;

	@ApiProperty({ format: 'date-time', type: String })
	startAt!: Date;

	@ApiProperty({ format: 'date-time', type: String })
	endAt!: Date;

	@ApiPropertyOptional({ format: 'date-time', type: String })
	publishedAt?: Date;

	@ApiPropertyOptional({ format: 'date-time', type: String })
	gamePublishedAt?: Date;

	static fromEntity(classroomGame: ClassroomGame): AdminClassroomGameResponseDto {
		const offer = classroomGame.institutionGameOffer;
		const game = offer.gameVariant.gameVersion.game;
		return {
			classroomId: classroomGame.classroom.id!,
			classroomName: classroomGame.classroom.name,
			classroomSlug: classroomGame.classroom.slug,
			designatedPayor: offer.designatedPayor,
			endAt: classroomGame.endAt,
			gameId: game.id!,
			gamePublishedAt: game.publishedAt,
			gameSlug: game.slug,
			gameTitle: game.title,
			gameVersionId: offer.gameVariant.gameVersion.id!,
			id: classroomGame.id!,
			institution: {
				id: classroomGame.classroom.institution.id!,
				name: classroomGame.classroom.institution.name,
				slug: classroomGame.classroom.institution.slug,
			},
			institutionGameOfferId: offer.id!,
			language: offer.gameVariant.language,
			licenseDurationDays: offer.licenseDurationDays,
			mode: offer.gameVariant.mode,
			price: offer.price,
			publisher: {
				id: game.publisher.id!,
				name: game.publisher.name,
				slug: game.publisher.slug,
			},
			publishedAt: classroomGame.publishedAt,
			publisherVersion: offer.gameVariant.gameVersion.publisherVersion,
			startAt: classroomGame.startAt,
		};
	}

}

export class GetAdminClassroomGameListResponseDto {

	@ApiProperty({ type: [AdminClassroomGameResponseDto] })
	classroomGameList!: AdminClassroomGameResponseDto[];

	@ApiProperty({ minimum: 0 })
	totalItemCount!: number;

	static fromQueryResult(result: { classroomGameList: ClassroomGame[]; totalItemCount: number }): GetAdminClassroomGameListResponseDto {
		return {
			classroomGameList: result.classroomGameList.map(AdminClassroomGameResponseDto.fromEntity),
			totalItemCount: result.totalItemCount,
		};
	}

}

export class GetAdminClassroomGameResponseDto {

	@ApiProperty({ type: AdminClassroomGameResponseDto })
	classroomGame!: AdminClassroomGameResponseDto;

	static fromEntity(classroomGame: ClassroomGame): GetAdminClassroomGameResponseDto {
		return { classroomGame: AdminClassroomGameResponseDto.fromEntity(classroomGame) };
	}

}