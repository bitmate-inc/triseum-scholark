import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { GameLicense } from '../../game/model/game.license.entity';
import { Classroom } from '../model/classroom.entity';
import { ClassroomGameListing } from '../model/classroom.game.listing.entity';
import { Instructor } from '../model/instructor.entity';
import { InstructorUser } from '../model/instructor.user.entity';

export interface GetInstructorClassroomResult {
	classroom: Classroom;
	classroomGameListingList: ClassroomGameListing[];
	gameLicenseList: GameLicense[];
}

@Injectable()
export class GetInstructorProfileQuery {

	constructor(private readonly entityManager: EntityManager) {}

	async execute(userId: string): Promise<Instructor | undefined> {
		const instructorUser = await this.entityManager.findOne(
			InstructorUser,
			{ user: userId },
			{ populate: ['instructor'] },
		);

		return instructorUser?.instructor;
	}

}

@Injectable()
export class GetInstructorClassroomListQuery {

	constructor(private readonly entityManager: EntityManager) {}

	async execute(userId: string): Promise<Classroom[]> {
		const instructorUser = await this.entityManager.findOne(
			InstructorUser,
			{ user: userId },
			{ populate: ['instructor'] },
		);
		if (!instructorUser) {
			return [];
		}

		return this.entityManager.find(
			Classroom,
			{ instructorList: instructorUser.instructor.id! },
			{ populate: ['institution'], orderBy: { name: 'ASC' } },
		);
	}

}

@Injectable()
export class GetInstructorClassroomQuery {

	constructor(private readonly entityManager: EntityManager) {}

	async execute(userId: string, classroomId: string): Promise<GetInstructorClassroomResult | undefined> {
		const instructorUser = await this.entityManager.findOne(
			InstructorUser,
			{ user: userId },
			{ populate: ['instructor'] },
		);
		if (!instructorUser) {
			return undefined;
		}

		const classroom = await this.entityManager.findOne(
			Classroom,
			{ id: classroomId, instructorList: instructorUser.instructor.id! },
			{ populate: ['institution'] },
		);
		if (!classroom) {
			return undefined;
		}

		const classroomGameListingList = await this.entityManager.find(
			ClassroomGameListing,
			{ classroom: classroom.id! },
			{ populate: ['gameVersion.game.publisher'], orderBy: { createdAt: 'ASC' } },
		);

		const classroomGameListingIdList = classroomGameListingList.map(({ id }) => id!);
		const gameLicenseList = classroomGameListingIdList.length === 0
			? []
			: await this.entityManager.find(
				GameLicense,
				{ classroomGameListing: { id: { $in: classroomGameListingIdList } } },
				{ populate: ['user', 'classroomGameListing'], orderBy: { createdAt: 'DESC' } },
			);

		return { classroom, classroomGameListingList, gameLicenseList };
	}

}