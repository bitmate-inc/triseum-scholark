import {
	EntityName,
	EntityRepository,
	FilterQuery,
} from '@mikro-orm/core';

import {
	EntityRepositoryInterface,
	FindBulkQuery,
	FindListQuery,
	FindOneQuery,
	FindOptions,
} from '../entity/repository/entity.repository.interface';
import { MikroOrmTransactionContext } from './mikro.orm.transaction.context';

export abstract class MikroOrmEntityRepository<Entity extends object> implements EntityRepositoryInterface<Entity> {

	protected constructor(
		private readonly entityName: EntityName<Entity>,
		private readonly defaultRepository: EntityRepository<Entity>,
		private readonly transactionContext: MikroOrmTransactionContext,
	) {}

	protected get repository(): EntityRepository<Entity> {
		const entityManager = this.transactionContext.getEntityManager();

		if (!entityManager) {
			return this.defaultRepository;
		}

		return entityManager.getRepository(this.entityName);
	}

	async findOneBy(query: FindOneQuery, options?: FindOptions<Entity>): Promise<Entity | undefined> {
		const result = await this.repository.findOne(this.buildWhere(query), {
			filters: options?.withDeleted ? { softDelete: false } : {},
			populate: this.toPopulate(options?.relations) as never,
		});

		return result ?? undefined;
	}

	findBy(query: FindListQuery, options?: FindOptions<Entity>): Promise<Entity[]> {
		return this.repository.find(this.buildWhere(query), {
			filters: options?.withDeleted ? { softDelete: false } : {},
			limit: options?.take,
			offset: options?.skip,
			populate: this.toPopulate(options?.relations) as never,
		});
	}

	findByAndCount(query: FindListQuery, options?: FindOptions<Entity>): Promise<[Entity[], number]> {
		return this.repository.findAndCount(this.buildWhere(query), {
			filters: options?.withDeleted ? { softDelete: false } : {},
			limit: options?.take,
			offset: options?.skip,
			populate: this.toPopulate(options?.relations) as never,
		});
	}

	findBulkBy(query: FindBulkQuery, options?: FindOptions<Entity>): Promise<Entity[]> {
		return this.findBy(this.normalizeBulkQuery(query), options);
	}

	findBulkByAndCount(query: FindBulkQuery, options?: FindOptions<Entity>): Promise<[Entity[], number]> {
		return this.findByAndCount(this.normalizeBulkQuery(query), options);
	}

	async save(entity: Entity): Promise<Entity> {
		await this.persistThenFlush(entity);
		return entity;
	}

	async saveBatch(entityList: Entity[]): Promise<Entity[]> {
		await this.persistThenFlush(entityList);
		return entityList;
	}

	async remove(entity: Entity): Promise<Entity> {
		await this.removeThenFlush(entity);
		return entity;
	}

	async removeBatch(entityList: Entity[]): Promise<Entity[]> {
		await this.removeThenFlush(entityList);
		return entityList;
	}

	async softRemove(entity: Entity): Promise<void> {
		(entity as { deletedAt?: Date }).deletedAt = new Date();
		await this.persistThenFlush(entity);
	}

	async softRemoveBatch(entityList: Entity[]): Promise<void> {
		for (const entity of entityList) {
			(entity as { deletedAt?: Date }).deletedAt = new Date();
		}

		await this.persistThenFlush(entityList);
	}

	private buildWhere(query: FindOneQuery | FindListQuery): FilterQuery<Entity> {
		const where: Record<string, unknown> = {};

		for (const property of Object.keys(query)) {
			const value = query[property];
			if (typeof value !== 'undefined') {
				where[property] = value;
			}
		}

		return where as FilterQuery<Entity>;
	}

	private normalizeBulkQuery(query: FindBulkQuery): FindListQuery {
		const { id, selectAll, ...rest } = query;

		if (id) {
			return { ...rest, id };
		}
		if (selectAll) {
			return rest;
		}

		return { ...rest, id: [] };
	}

	private async persistThenFlush(entityOrEntityList: Entity | Entity[]): Promise<void> {
		const entityManager = this.repository.getEntityManager();
		entityManager.persist(entityOrEntityList);
		await entityManager.flush();
	}

	private async removeThenFlush(entityOrEntityList: Entity | Entity[]): Promise<void> {
		const entityManager = this.repository.getEntityManager();
		entityManager.remove(entityOrEntityList);
		await entityManager.flush();
	}

	private toPopulate(relations: Record<string, unknown> | undefined): string[] {
		if (!relations) {
			return [];
		}

		const pathList: string[] = [];
		const walk = (value: Record<string, unknown>, prefix: string): void => {
			for (const key of Object.keys(value)) {
				const relation = value[key];
				const path = prefix ? `${prefix}.${key}` : key;

				if (relation === true) {
					pathList.push(path);
				} else if (typeof relation === 'object' && relation !== null) {
					walk(relation as Record<string, unknown>, path);
				}
			}
		};

		walk(relations, '');
		return pathList;
	}

}
