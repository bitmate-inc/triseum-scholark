import { EntityRepository, LockMode } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MikroOrmEntityRepository } from '../../../../../lib/database/mikro.orm.entity.repository';
import { MikroOrmTransactionContext } from '../../../../../lib/database/mikro.orm.transaction.context';
import { ClassroomGameListing } from '../model/classroom.game.listing.entity';

@Injectable()
export class ClassroomGameListingRepository extends MikroOrmEntityRepository<ClassroomGameListing> {

	constructor(
		@InjectRepository(ClassroomGameListing) repository: EntityRepository<ClassroomGameListing>,
		transactionContext: MikroOrmTransactionContext,
	) {
		super(ClassroomGameListing, repository, transactionContext);
	}

	findByClassroomAndGameVersion(
		classroomId: string,
		gameVersionId: string,
		excludingListingId?: string,
	): Promise<ClassroomGameListing[]> {
		const where = excludingListingId
			? { classroom: classroomId, gameVersion: gameVersionId, id: { $ne: excludingListingId } }
			: { classroom: classroomId, gameVersion: gameVersionId };
		return this.repository.find(where);
	}

	async findForLicenseIssuance(id: string): Promise<ClassroomGameListing | undefined> {
		return (await this.repository.findOne(
			{ id },
			{
				lockMode: LockMode.PESSIMISTIC_WRITE,
				populate: ['classroom.institution', 'customization', 'gameVersion.game'],
			},
		)) ?? undefined;
	}

	async findForAcquisition(id: string): Promise<ClassroomGameListing | undefined> {
		return (await this.repository.findOne(
			{ id, publishedAt: { $lte: new Date() } },
			{
				populate: [
					'classroom.institution',
					'customization',
					'gameVersion.game',
					'gameVersion.game.publisher',
					'gameVersion.game.taxonomyList.taxonomyTerm',
				] as never,
			},
		)) ?? undefined;
	}

}