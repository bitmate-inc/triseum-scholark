import { Type } from 'class-transformer';

import { StaticFactory } from '../../factory/static.factory';
import {
	GetListFilterByDto,
	IncludeDto,
	OrderByDto,
	PaginationDto,
} from './query.dto';

export class GetListQueryData extends StaticFactory {

	@Type(() => GetListFilterByDto)
	filterBy?: GetListFilterByDto;

	@Type(() => OrderByDto)
	orderBy?: OrderByDto;

	@Type(() => PaginationDto)
	pagination?: PaginationDto;

	@Type(() => IncludeDto)
	include?: IncludeDto;

	@Type(() => Boolean)
	withDeleted?: boolean;

}

export class GetListQueryResult extends StaticFactory {

	totalItemCount!: number;

}