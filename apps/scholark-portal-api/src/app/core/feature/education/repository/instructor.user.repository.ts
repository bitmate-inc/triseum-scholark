import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import type { Instructor } from '../model/instructor.entity';
import { InstructorUser } from '../model/instructor.user.entity';

@Injectable()
export class InstructorUserRepository {

	constructor(
		@InjectRepository(InstructorUser)
		private readonly instructorUserRepository: EntityRepository<InstructorUser>,
	) {}

	async findByUserId(userId: string) {
		return this.instructorUserRepository.findOne(
			{ user: { id: userId } },
			{ populate: ['instructor'] },
		);
	}

	async findByInstructorId(instructorId: string) {
		return this.instructorUserRepository.findOne(
			{ instructor: { id: instructorId } },
			{ populate: ['user'] },
		);
	}

	async findByInstructorIdList(instructorIdList: string[]): Promise<InstructorUser[]> {
		if (instructorIdList.length === 0) {
			return [];
		}

		return this.instructorUserRepository.find({
			instructor: { id: { $in: instructorIdList } },
		});
	}

	async existsByUserId(userId: string): Promise<boolean> {
		const instructorUser = await this.instructorUserRepository.findOne(
			{ user: { id: userId } },
			{ fields: ['id'] },
		);

		return !!instructorUser;
	}

	create(user: InstructorUser['user'], instructor: Instructor): InstructorUser {
		return this.instructorUserRepository.create({ user, instructor });
	}

	async save(instructorUser: InstructorUser): Promise<InstructorUser> {
		const entityManager = this.instructorUserRepository.getEntityManager();
		entityManager.persist(instructorUser);
		await entityManager.flush();
		return instructorUser;
	}

}