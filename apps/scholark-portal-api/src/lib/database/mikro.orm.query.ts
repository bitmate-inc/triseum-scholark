import { OrderByDto, PaginationDto } from '../entity/query/query.dto';

type QueryBuilderLike<Entity extends object> = {
	limit(limit: number): QueryBuilderLike<Entity>;
	offset(offset: number): QueryBuilderLike<Entity>;
	orderBy(orderBy: Record<string, unknown>): QueryBuilderLike<Entity>;
};

export function addPagination<Entity extends object>(
	queryBuilder: QueryBuilderLike<Entity>,
	pagination?: PaginationDto,
): void {
	if (pagination?.limit !== undefined) {
		queryBuilder.limit(pagination.limit);
	}

	if (pagination?.offset !== undefined) {
		queryBuilder.offset(pagination.offset);
	}
}

export function addOrderBy<Entity extends object>(
	queryBuilder: QueryBuilderLike<Entity>,
	orderBy?: OrderByDto,
	defaultSort?: string,
	defaultOrder?: 'ASC' | 'DESC',
) {
	if (orderBy) {
		for (const property of Object.keys(orderBy)) {
			const direction = orderBy[property];
			queryBuilder.orderBy({
				[property]: direction.toUpperCase(),
			});
		}
	} else if (defaultSort) {
		queryBuilder.orderBy({ [defaultSort]: defaultOrder });
	}
}