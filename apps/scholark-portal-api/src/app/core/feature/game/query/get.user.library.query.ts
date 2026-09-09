import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { ClassroomGameEnrollment } from '../../education/model/classroom.game.enrollment.entity';
import { GameLicense } from '../model/game.license.entity';

export type UserLibraryItem = {
	license: GameLicense;
	enrollmentList: ClassroomGameEnrollment[];
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
			enrollmentList: license.enrollmentList.getItems(),
			license,
		}));
	}

}