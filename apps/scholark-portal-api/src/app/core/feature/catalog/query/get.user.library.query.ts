import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { GameAcquisition } from '../../game/model/game.acquisition.entity';
import { GameLicense } from '../../game/model/game.license.entity';

export type UserLibraryItem = {
	license: GameLicense;
	acquisition?: GameAcquisition;
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
		const acquisitionList = await this.entityManager.find(GameAcquisition, {
			license: { $in: licenseList },
		});
		const acquisitionByLicenseId = new Map(acquisitionList.map((acquisition) => [acquisition.license.id, acquisition]));

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
			.map((license) => ({ license, acquisition: acquisitionByLicenseId.get(license.id!) }));
	}

}