import { StaticFactory } from '../../factory/static.factory';

export class PaginationDto extends StaticFactory {

	limit?: number;

	offset?: number;

}

export class OrderByDto extends StaticFactory {

	[propertyPath: string]: 'asc' | 'desc';

}

export class IncludeDto extends StaticFactory {

	[propertyPath: string]: boolean | IncludeDto | undefined;

}

export class FilterByDto extends StaticFactory {

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[propertyPath: string]: any;

}

export class DateTimeFilterDto {

	gte?: Date;

	lte?: Date;

	gt?: Date;

	lt?: Date;

}

export class GetOneFilterByDto extends FilterByDto {

	id?: string;

}

export class GetListFilterByDto extends FilterByDto {

	id?: string[];

	q?: string;

}