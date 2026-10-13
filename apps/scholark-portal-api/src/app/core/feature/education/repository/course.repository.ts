import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { Course } from '../model/course.entity';
import { EducationCatalogStatus } from '../model/education.catalog.status';

@Injectable()
export class CourseRepository extends MikroOrmEntityRepository<Course> {

	constructor(
		@InjectRepository(Course) repository: EntityRepository<Course>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(Course, repository, transactionContext);
	}

	countActiveByInstitution(institutionId: string): Promise<number> {
		return this.repository.count({ institution: institutionId, status: EducationCatalogStatus.ACTIVE });
	}

}