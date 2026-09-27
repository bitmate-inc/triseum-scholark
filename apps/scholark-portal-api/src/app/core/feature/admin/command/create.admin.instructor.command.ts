import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { Classroom } from '../../education/model/classroom.entity';
import { Institution } from '../../education/model/institution.entity';
import { Instructor } from '../../education/model/instructor.entity';

export interface CreateAdminInstructorCommandData {
	classroomIdList?: string[];
	institutionIdList?: string[];
	name: string;
	slug: string;
}

@Injectable()
export class CreateAdminInstructorCommand {

	constructor(
		@InjectRepository(Classroom)
		private readonly classroomRepository: EntityRepository<Classroom>,
		@InjectRepository(Institution)
		private readonly institutionRepository: EntityRepository<Institution>,
		@InjectRepository(Instructor)
		private readonly instructorRepository: EntityRepository<Instructor>,
	) {}

	async execute(data: CreateAdminInstructorCommandData): Promise<Instructor> {
		const slug = data.slug.trim();
		if (await this.instructorRepository.findOne({ slug })) {
			throw new ConflictException('An instructor with this slug already exists.');
		}

		const instructor = this.instructorRepository.create({ name: data.name.trim(), slug });
		const [institutionList, classroomList] = await Promise.all([
			this.loadInstitutions(data.institutionIdList ?? []),
			this.loadClassrooms(data.classroomIdList ?? []),
		]);
		for (const institution of institutionList) {
			institution.instructorList.add(instructor);
		}
		for (const classroom of classroomList) {
			classroom.instructorList.add(instructor);
		}

		const entityManager = this.instructorRepository.getEntityManager();
		entityManager.persist(instructor);
		await entityManager.flush();

		return instructor;
	}

	private async loadInstitutions(idList: string[]): Promise<Institution[]> {
		const uniqueIdList = [...new Set(idList)];
		const institutionList = await this.institutionRepository.find(
			{ id: { $in: uniqueIdList } },
			{ populate: ['instructorList'] },
		);
		if (institutionList.length !== uniqueIdList.length) {
			throw new NotFoundException('One or more selected institutions were not found.');
		}
		return institutionList;
	}

	private async loadClassrooms(idList: string[]): Promise<Classroom[]> {
		const uniqueIdList = [...new Set(idList)];
		const classroomList = await this.classroomRepository.find(
			{ id: { $in: uniqueIdList } },
			{ populate: ['instructorList'] },
		);
		if (classroomList.length !== uniqueIdList.length) {
			throw new NotFoundException('One or more selected classrooms were not found.');
		}
		return classroomList;
	}

}