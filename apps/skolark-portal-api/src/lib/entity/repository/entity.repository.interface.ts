export interface FindOneQuery {
	id?: string;

	[property: string]: unknown;
}

export interface FindListQuery {
	id?: string[];

	[property: string]: unknown;
}

export interface FindBulkQuery extends FindListQuery {
	selectAll?: boolean;
}

export type FindOptionsRelationsProperty<Property> =
	Property extends Promise<infer Item>
		? FindOptionsRelationsProperty<NonNullable<Item>> | boolean
		: Property extends Array<infer Item>
			? FindOptionsRelationsProperty<NonNullable<Item>> | boolean
			: Property extends (...args: unknown[]) => unknown
				? never
				: Property extends Uint8Array
					? never
					: Property extends Date
						? never
						: Property extends object
							? FindOptionsRelations<Property> | boolean
							: boolean;

type FindOptionsRelations<Entity> = {
	[Property in keyof Entity]?: Property extends 'toString'
		? unknown
		: FindOptionsRelationsProperty<NonNullable<Entity[Property]>>;
};

export interface FindOptions<Entity> {
	relations?: FindOptionsRelations<Entity>;
	skip?: number;
	take?: number;
	withDeleted?: boolean;
}

export interface EntityRepositoryInterface<Entity> {
	findOneBy(
		query: FindOneQuery,
		options?: FindOptions<Entity>,
	): Promise<Entity | undefined>;

	findBy(query: FindListQuery, options?: FindOptions<Entity>): Promise<Entity[]>;

	findByAndCount(
		query: FindListQuery,
		options?: FindOptions<Entity>,
	): Promise<[Entity[], number]>;

	findBulkBy(
		query: FindBulkQuery,
		options?: FindOptions<Entity>,
	): Promise<Entity[]>;

	findBulkByAndCount(
		query: FindBulkQuery,
		options?: FindOptions<Entity>,
	): Promise<[Entity[], number]>;

	save(entity: Entity): Promise<Entity>;

	saveBatch(entityList: Entity[]): Promise<Entity[]>;

	remove(entity: Entity): Promise<Entity>;

	removeBatch(entityList: Entity[]): Promise<Entity[]>;

	softRemove(entity: Entity): Promise<void>;

	softRemoveBatch(entityList: Entity[]): Promise<void>;
}