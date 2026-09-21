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

		return licenseList
			.sort((firstLicense, secondLicense) => {
				const now = new Date();
				const getStatusOrder = (license: GameLicense): number => {
					if (license.isActive(now)) return 2;
					if (license.startAt > now) return 1;

					return 0;
				};
				const firstStatusOrder = getStatusOrder(firstLicense);
				const secondStatusOrder = getStatusOrder(secondLicense);

				return secondStatusOrder - firstStatusOrder
					|| secondLicense.endAt.getTime() - firstLicense.endAt.getTime()
					|| secondLicense.createdAt!.getTime() - firstLicense.createdAt!.getTime();
			})
			.map((license) => ({ license }));
	}

}