import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

import { GetListRequestQueryParamsDto } from '../../../lib/http/request-query.dto';
import {
	GetCatalogClassroomGameListFilterByDto,
	GetCatalogClassroomGameListQueryResult,
} from '../../core/feature/catalog/query/get.catalog.classroom-game.query';
import { ClassroomGame } from '../../core/feature/education/model/classroom.game.entity';
import { InstitutionContractDesignatedPayor } from '../../core/feature/education/model/institution.contract.entity';
import { GameResponseDto } from './game.dto';
import { InstitutionResponseDto } from './institution.dto';

export class GetClassroomGameListQueryDto extends GetListRequestQueryParamsDto {

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

	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	taxonomyTermId?: string;

	override get filterBy(): GetCatalogClassroomGameListFilterByDto {
		return GetCatalogClassroomGameListFilterByDto.create({
			...super.filterBy,
			classroomId: this.classroomId,
			gameId: this.gameId,
			institutionId: this.institutionId,
			taxonomyTermId: this.taxonomyTermId,
		});
	}

}

class ClassroomGameClassroomResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

	@ApiProperty({ type: InstitutionResponseDto })
	institution!: InstitutionResponseDto;

}

export class ClassroomGameResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ type: ClassroomGameClassroomResponseDto })
	classroom!: ClassroomGameClassroomResponseDto;

	@ApiProperty({ type: GameResponseDto })
	game!: GameResponseDto;

	@ApiProperty({ format: 'uuid' })
	contractGameProductId!: string;

	@ApiProperty({ enum: InstitutionContractDesignatedPayor, enumName: 'InstitutionContractDesignatedPayor' })
	designatedPayor!: InstitutionContractDesignatedPayor;

	@ApiProperty({ format: 'uuid' })
	gameVersionId!: string;

	@ApiProperty({ format: 'date-time', type: String })
	startAt!: Date;

	@ApiProperty({ format: 'date-time', type: String })
	endAt!: Date;

	@ApiProperty({ minimum: 1 })
	licenseDurationDays!: number;

	@ApiProperty({ format: 'date-time', type: String })
	createdAt!: Date;

	@ApiProperty({ format: 'date-time', type: String })
	updatedAt!: Date;

	static fromEntity(classroomGame: ClassroomGame): ClassroomGameResponseDto {
		return {
			classroom: {
				id: classroomGame.classroom.id!,
				institution: InstitutionResponseDto.fromEntity(classroomGame.classroom.institution),
				name: classroomGame.classroom.name,
				slug: classroomGame.classroom.slug,
			},
			createdAt: classroomGame.createdAt!,
			game: GameResponseDto.fromEntity(classroomGame.contractGameProduct.gameProduct.gameVariant.gameVersion.game),
			contractGameProductId: classroomGame.contractGameProduct.id!,
			designatedPayor: classroomGame.contractGameProduct.contract.designatedPayor,
			gameVersionId: classroomGame.contractGameProduct.gameProduct.gameVariant.gameVersion.id!,
			id: classroomGame.id!,
			endAt: classroomGame.endAt,
			licenseDurationDays: classroomGame.contractGameProduct.licenseDurationDays,
			startAt: classroomGame.startAt,
			updatedAt: classroomGame.updatedAt!,
		};
	}

}

export class GetClassroomGameResponseDto {

	@ApiProperty({ type: ClassroomGameResponseDto })
	classroomGame!: ClassroomGameResponseDto;

	static fromEntity(classroomGame: ClassroomGame): GetClassroomGameResponseDto {
		return { classroomGame: ClassroomGameResponseDto.fromEntity(classroomGame) };
	}

}

export class GetClassroomGameListResponseDto {

	@ApiProperty({ type: [ClassroomGameResponseDto] })
	classroomGameList!: ClassroomGameResponseDto[];

	@ApiProperty({ minimum: 0 })
	totalItemCount!: number;

	static fromQueryResult(result: GetCatalogClassroomGameListQueryResult): GetClassroomGameListResponseDto {
		return {
			classroomGameList: result.classroomGameList.map(ClassroomGameResponseDto.fromEntity),
			totalItemCount: result.totalItemCount,
		};
	}

}