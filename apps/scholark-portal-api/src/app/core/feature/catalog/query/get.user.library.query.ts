import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { GameLicense } from '../../game/model/game.license.entity';

export type UserLibraryItem = {
	license: GameLicense;
};

@Injectable()
export class GetUserLibraryQuery {

	constructor(private readonly entityManager: EntityManager) {}

	async execute(userId: string): Promise<UserLibraryItem[]> {
		const licenseList = await this.entityManager.find(
			GameLicense,
			{ user: userId },
			{
				populate: [
					'gameVariant.gameVersion.game',
					'customization',
					'classroomGame.classroom',
					'classroomGame.customization',
				],
				orderBy: { endAt: 'desc' },
			},
		);

		return licenseList.map((license) => ({ license }));
	}

}