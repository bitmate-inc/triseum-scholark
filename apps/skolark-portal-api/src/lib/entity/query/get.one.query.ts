import { Type } from 'class-transformer';

import { StaticFactory } from '../../factory/static.factory';
import {
	GetOneFilterByDto,
	IncludeDto,
	OrderByDto
} from './query.dto';

export class GetOneQueryData extends StaticFactory {

	@Type(() => GetOneFilterByDto)
	filterBy?: GetOneFilterByDto;

	@Type(() => OrderByDto)
	orderBy?: OrderByDto;

	@Type(() => IncludeDto)
	include?: IncludeDto;

	@Type(() => Boolean)
	withDeleted?: boolean;

}