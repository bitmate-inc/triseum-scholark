import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { Instructor } from '../model/instructor.entity';

@Injectable()
export class InstructorRepository extends MikroOrmEntityRepository<Instructor> {

	constructor(
		@InjectRepository(Instructor) repository: EntityRepository<Instructor>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(Instructor, repository, transactionContext);
	}

}