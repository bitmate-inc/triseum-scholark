import {
	Controller,
	Get,
	NotFoundException,
	Param,
	ParseUUIDPipe,
	Query,
} from '@nestjs/common';
import {
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger';

import { GetCatalogInstitutionListQuery, GetCatalogInstitutionQuery } from '../../core/feature/catalog/query/get.catalog.institution.query';
import {
	GetInstitutionListQueryDto,
	GetInstitutionListResponseDto,
	GetInstitutionResponseDto,
} from './institution.dto';

@ApiTags('Catalog Institutions')
@Controller('api/v1/catalog/institution')
export class InstitutionController {

	constructor(
		private readonly getInstitutionListQuery: GetCatalogInstitutionListQuery,
		private readonly getInstitutionQuery: GetCatalogInstitutionQuery,
	) {}

	@Get()
	@ApiOperation({ summary: 'List educational institutions' })
	@ApiOkResponse({ type: GetInstitutionListResponseDto })
	async getInstitutionList(
		@Query() query: GetInstitutionListQueryDto,
	): Promise<GetInstitutionListResponseDto> {
		const result = await this.getInstitutionListQuery.execute({
			filterBy: query.filterBy,
			pagination: query.pagination,
		});
		return GetInstitutionListResponseDto.fromQueryResult(result);
	}

	@Get('by-slug/:slug')
	@ApiOperation({ summary: 'Get an educational institution by slug' })
	@ApiParam({ name: 'slug' })
	@ApiOkResponse({ type: GetInstitutionResponseDto })
	@ApiNotFoundResponse({ description: 'Educational institution not found' })
	async getInstitutionBySlug(@Param('slug') slug: string): Promise<GetInstitutionResponseDto> {
		return this.getInstitution({ slug });
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get an educational institution by ID' })
	@ApiParam({ format: 'uuid', name: 'id' })
	@ApiOkResponse({ type: GetInstitutionResponseDto })
	@ApiNotFoundResponse({ description: 'Educational institution not found' })
	async getInstitutionById(
		@Param('id', ParseUUIDPipe) id: string,
	): Promise<GetInstitutionResponseDto> {
		return this.getInstitution({ id });
	}

	private async getInstitution(filterBy: { id?: string; slug?: string }): Promise<GetInstitutionResponseDto> {
		const result = await this.getInstitutionQuery.execute({ filterBy });
		if (!result.institution) {
			throw new NotFoundException('Educational institution not found');
		}

		return GetInstitutionResponseDto.fromEntity(result.institution);
	}

}