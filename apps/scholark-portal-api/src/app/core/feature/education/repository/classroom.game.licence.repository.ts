import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { ClassroomGameLicence } from '../model/classroom.game.licence.entity';

@Injectable()
export class ClassroomGameLicenceRepository extends MikroOrmEntityRepository<ClassroomGameLicence> {

	constructor(
		@InjectRepository(ClassroomGameLicence) repository: EntityRepository<ClassroomGameLicence>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(ClassroomGameLicence, repository, transactionContext);
	}

	async findByClassroomGameAndUser(classroomGameId: string, userId: string): Promise<ClassroomGameLicence | undefined> {
		return this.findOneBy({
			classroomGame: classroomGameId,
			gameLicense: { user: userId },
		});
	}

}