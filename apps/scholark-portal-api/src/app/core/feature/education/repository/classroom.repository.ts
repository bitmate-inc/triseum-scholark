import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { Classroom } from '../model/classroom.entity';
import { EducationCatalogStatus } from '../model/education.catalog.status';

@Injectable()
export class ClassroomRepository extends MikroOrmEntityRepository<Classroom> {

	constructor(
		@InjectRepository(Classroom) repository: EntityRepository<Classroom>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(Classroom, repository, transactionContext);
	}

	countActiveByInstitution(institutionId: string): Promise<number> {
		return this.repository.count({ institution: institutionId, status: EducationCatalogStatus.ACTIVE });
	}

}