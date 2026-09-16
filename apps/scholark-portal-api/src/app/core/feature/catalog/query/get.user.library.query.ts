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
				],
				orderBy: { endAt: 'desc' },
			},
		);
		const enrollmentList = licenseList.length
			? await this.entityManager.find(
				ClassroomGameLicence,
				{ gameLicense: { $in: licenseList.map((license) => license.id!) } },
				{
					populate: [
						'classroomGame.classroom',
						'classroomGame.customization',
					],
				},
			)
			: [];
		const enrollmentListByLicenseId = new Map<string, ClassroomGameLicence[]>();
		for (const enrollment of enrollmentList) {
			const enrollmentListForLicense = enrollmentListByLicenseId.get(enrollment.gameLicense.id!) ?? [];
			enrollmentListForLicense.push(enrollment);
			enrollmentListByLicenseId.set(enrollment.gameLicense.id!, enrollmentListForLicense);
		}

		return licenseList.map((license) => ({
			enrollmentList: enrollmentListByLicenseId.get(license.id!) ?? [],
			license,
		}));
	}

}