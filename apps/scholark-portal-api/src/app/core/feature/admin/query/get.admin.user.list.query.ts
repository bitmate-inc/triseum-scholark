import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { addOrderBy, addPagination } from '../../../../../lib/database/mikro.orm.query';
import type { PaginationDto } from '../../../../../lib/entity/query/query.dto';
import {
	ASCII_CHARACTER_LIST,
	DIACRITIC_CHARACTER_LIST,
	normalizeCatalogSearchQuery,
} from '../../catalog/query/catalog.search';
import { User, UserStatus } from '../../user/model/user.entity';
import { AdminUser } from '../model/admin.user.entity';

export interface GetAdminUserListQueryData {
	filterBy?: { q?: string; status?: UserStatus };
	pagination?: PaginationDto;
}

@Injectable()
export class GetAdminUserListQuery {

	constructor(
		@InjectRepository(User)
		private readonly userRepository: EntityRepository<User>,
		@InjectRepository(AdminUser)
		private readonly adminUserRepository: EntityRepository<AdminUser>,
	) {}

	async execute(data: GetAdminUserListQueryData): Promise<{
		adminUserIdSet: Set<string>;
		totalItemCount: number;
		userList: User[];
	}> {
		const queryBuilder = this.userRepository.createQueryBuilder('user');
		const searchQuery = data.filterBy?.q?.trim();

		if (data.filterBy?.status) {
			queryBuilder.andWhere({ status: data.filterBy.status });
		}

		if (searchQuery) {
			const searchPattern = `%${normalizeCatalogSearchQuery(searchQuery)}%`;
			const searchFields = ['"user"."email"', '"user"."first_name"', '"user"."last_name"'];
			const predicates = searchFields.map((field) =>
				`translate(lower(${field}), '${DIACRITIC_CHARACTER_LIST}', '${ASCII_CHARACTER_LIST}') like ?`,
			);
			queryBuilder.andWhere(`(${predicates.join(' or ')})`, searchFields.map(() => searchPattern));
		}

		addPagination(queryBuilder, data.pagination);
		addOrderBy(queryBuilder, undefined, 'user.email', 'ASC');

		const [userList, totalItemCount] = await queryBuilder.getResultAndCount();
		const userIdList = userList.map((user) => user.id!);
		const adminUserList = userIdList.length === 0
			? []
			: await this.adminUserRepository.find({ user: { $in: userIdList } });

		return {
			adminUserIdSet: new Set(adminUserList.map((adminUser) => adminUser.user.id!)),
			totalItemCount,
			userList,
		};
	}

}