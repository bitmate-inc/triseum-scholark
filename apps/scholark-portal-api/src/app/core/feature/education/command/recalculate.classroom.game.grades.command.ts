import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { GameLicense } from '../../game/model/game.license.entity';
import { CalculateGameLicenseGradeCommand } from './calculate.game.license.grade.command';

@Injectable()
export class RecalculateClassroomGameGradesCommand {

	constructor(
		private readonly entityManager: EntityManager,
		private readonly calculateGameLicenseGradeCommand: CalculateGameLicenseGradeCommand,
	) {}

	async execute(classroomGameListingId: string): Promise<void> {
		const gameLicenseList = await this.entityManager.find(GameLicense, {
			classroomGameListing: classroomGameListingId,
		});

		for (const gameLicense of gameLicenseList) {
			await this.calculateGameLicenseGradeCommand.execute(gameLicense.id!);
		}
	}

}