import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { AdminUser } from '../model/admin.user.entity';

@Injectable()
export class AdminUserRepository {

	constructor(
		@InjectRepository(AdminUser)
		private readonly repository: EntityRepository<AdminUser>,
	) {}

	async existsByUserId(userId: string): Promise<boolean> {
		const adminUser = await this.repository.findOne(
			{ user: { id: userId } },
			{ fields: ['id'] },
		);

		return !!adminUser;
	}

}