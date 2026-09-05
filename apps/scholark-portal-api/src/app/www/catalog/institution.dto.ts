import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { GetListRequestQueryParamsDto } from '../../../lib/http/request-query.dto';
import { GetCatalogInstitutionListFilterByDto, GetCatalogInstitutionListQueryResult } from '../../core/feature/catalog/query/get.catalog.institution.query';
import { EducationCatalogStatus } from '../../core/feature/education/model/education.catalog.status';
import { EducationalInstitution } from '../../core/feature/education/model/educational.institution.entity';
import { MediaResponseDto } from '../media/media.dto';

export class GetInstitutionListQueryDto extends GetListRequestQueryParamsDto {

	@ApiPropertyOptional({ enum: EducationCatalogStatus, enumName: 'EducationCatalogStatus' })
	@IsOptional()
	@IsEnum(EducationCatalogStatus)
	status?: EducationCatalogStatus;

	override get filterBy(): GetCatalogInstitutionListFilterByDto {
		return GetCatalogInstitutionListFilterByDto.create({
			...super.filterBy,
			status: this.status,
		});
	}

}

export class InstitutionResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

	@ApiPropertyOptional({ type: MediaResponseDto })
	cover?: MediaResponseDto;

	@ApiPropertyOptional()
	summary?: string;

	@ApiPropertyOptional()
	description?: string;

	@ApiPropertyOptional({ format: 'uri' })
	websiteUrl?: string;

	@ApiProperty({ enum: EducationCatalogStatus, enumName: 'EducationCatalogStatus' })
	status!: EducationCatalogStatus;

	static fromEntity(institution: EducationalInstitution): InstitutionResponseDto {
		return {
			cover: institution.cover,
			description: institution.description,
			id: institution.id!,
			name: institution.name,
			slug: institution.slug,
			status: institution.status,
			summary: institution.summary,
			websiteUrl: institution.websiteUrl,
		};
	}

}

export class GetInstitutionResponseDto {

	@ApiProperty({ type: InstitutionResponseDto })
	institution!: InstitutionResponseDto;

	static fromEntity(institution: EducationalInstitution): GetInstitutionResponseDto {
		return { institution: InstitutionResponseDto.fromEntity(institution) };
	}

}

export class GetInstitutionListResponseDto {

	@ApiProperty({ type: [InstitutionResponseDto] })
	institutionList!: InstitutionResponseDto[];

	@ApiProperty({ minimum: 0 })
	totalItemCount!: number;

	static fromQueryResult(result: GetCatalogInstitutionListQueryResult): GetInstitutionListResponseDto {
		return {
			institutionList: result.institutionList.map(InstitutionResponseDto.fromEntity),
			totalItemCount: result.totalItemCount,
		};
	}

}