import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { ClassroomGameLicence } from '../../education/model/classroom.game.licence.entity';
import { GameLicense } from '../../game/model/game.license.entity';

export type UserLibraryItem = {
	license: GameLicense;
	enrollmentList: ClassroomGameLicence[];
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
					'gameVersion.game',
					'customization',
					'enrollmentList.classroomGame.classroom',
					'enrollmentList.classroomGame.customization',
				],
				orderBy: { endAt: 'desc' },
			},
		);

		return licenseList.map((license) => ({
			enrollmentList: license.enrollmentList?.getItems() ?? [],
			license,
		}));
	}

}