import { Injectable } from '@nestjs/common';

import { GetOneQueryData } from '../../../../../lib/entity/query/get.one.query';
import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { User } from '../model/user.entity';
import { UserRepository } from '../repository/user.repository';

export class GetUserQueryData extends GetOneQueryData {

}

export class GetUserQueryResult extends StaticFactory {

	user?: User;

}

@Injectable()
export class GetUserQuery {

	constructor(
		private readonly userRepository: UserRepository,
	) {
	}

	async execute(data: GetUserQueryData): Promise<GetUserQueryResult> {
		const user = data.filterBy?.id
			? await this.userRepository.findById(data.filterBy.id)
			: undefined;

		return GetUserQueryResult.create({ user: user || undefined });
	}

}
