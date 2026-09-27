import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { GetListRequestQueryParamsDto } from '../../../lib/http/request-query.dto';
import type { GetAdminTaxonomyTermListQueryData } from '../../core/feature/admin/query/get.admin.taxonomy.term.query';
import { TaxonomyTerm, TaxonomyType } from '../../core/feature/taxonomy/model/taxonomy.term.entity';

export class GetAdminTaxonomyTermListQueryDto extends GetListRequestQueryParamsDto {

	@ApiPropertyOptional({ enum: TaxonomyType, enumName: 'TaxonomyType' })
	@IsOptional()
	@IsEnum(TaxonomyType)
	type?: TaxonomyType;

	get adminFilterBy(): GetAdminTaxonomyTermListQueryData['filterBy'] {
		return { q: this.q, type: this.type };
	}

}

export class AdminTaxonomyTermListItemResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ enum: TaxonomyType, enumName: 'TaxonomyType' })
	type!: TaxonomyType;

	@ApiProperty()
	label!: string;

	@ApiProperty()
	slug!: string;

	static fromEntity(taxonomyTerm: TaxonomyTerm): AdminTaxonomyTermListItemResponseDto {
		return {
			id: taxonomyTerm.id!,
			label: taxonomyTerm.label,
			slug: taxonomyTerm.slug,
			type: taxonomyTerm.type,
		};
	}

}

export class AdminTaxonomyTermResponseDto {

	@ApiProperty({ type: AdminTaxonomyTermListItemResponseDto })
	taxonomyTerm!: AdminTaxonomyTermListItemResponseDto;

	static fromEntity(taxonomyTerm: TaxonomyTerm): AdminTaxonomyTermResponseDto {
		return { taxonomyTerm: AdminTaxonomyTermListItemResponseDto.fromEntity(taxonomyTerm) };
	}

}

export class GetAdminTaxonomyTermListResponseDto {

	@ApiProperty({ type: [AdminTaxonomyTermListItemResponseDto] })
	taxonomyTermList!: AdminTaxonomyTermListItemResponseDto[];

	@ApiProperty({ minimum: 0 })
	totalItemCount!: number;

	static fromQueryResult(result: { taxonomyTermList: TaxonomyTerm[]; totalItemCount: number }): GetAdminTaxonomyTermListResponseDto {
		return {
			taxonomyTermList: result.taxonomyTermList.map(AdminTaxonomyTermListItemResponseDto.fromEntity),
			totalItemCount: result.totalItemCount,
		};
	}

}