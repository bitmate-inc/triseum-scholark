import { Injectable } from '@nestjs/common';

import { GetOneQueryData } from '../../../../../lib/entity/query/get.one.query';
import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { User } from '../model/user.entity';
import { UserEntityRepository } from '../repository/user.entity.repository';

export class GetUserQueryData extends GetOneQueryData {

}

export class GetUserQueryResult extends StaticFactory {

	user?: User;

}

@Injectable()
export class GetUserQuery {

	constructor(
		private readonly userRepository: UserEntityRepository,
	) {
	}

	async execute(data: GetUserQueryData): Promise<GetUserQueryResult> {
		const user = data.filterBy?.id
			? await this.userRepository.findOneBy({ id: data.filterBy.id })
			: undefined;

		return GetUserQueryResult.create({ user: user || undefined });
	}

}
