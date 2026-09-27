import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { Classroom } from '../../education/model/classroom.entity';
import { Institution } from '../../education/model/institution.entity';
import { Instructor } from '../../education/model/instructor.entity';

export interface UpdateAdminInstructorCommandData {
	classroomIdList?: string[];
	institutionIdList?: string[];
	name?: string;
	slug?: string;
}

@Injectable()
export class UpdateAdminInstructorCommand {

	constructor(
		@InjectRepository(Classroom)
		private readonly classroomRepository: EntityRepository<Classroom>,
		@InjectRepository(Institution)
		private readonly institutionRepository: EntityRepository<Institution>,
		@InjectRepository(Instructor)
		private readonly instructorRepository: EntityRepository<Instructor>,
	) {}

	async execute(id: string, data: UpdateAdminInstructorCommandData): Promise<Instructor> {
		if (Object.keys(data).length === 0) {
			throw new BadRequestException('At least one instructor field must be provided.');
		}

		const instructor = await this.instructorRepository.findOne({ id });
		if (!instructor) {
			throw new NotFoundException('Instructor not found.');
		}

		if (typeof data.slug !== 'undefined') {
			const slug = data.slug.trim();
			const existingInstructor = await this.instructorRepository.findOne({ slug });
			if (existingInstructor && existingInstructor.id !== id) {
				throw new ConflictException('An instructor with this slug already exists.');
			}
			instructor.slug = slug;
		}
		if (typeof data.name !== 'undefined') {
			instructor.name = data.name.trim();
		}

		const [currentInstitutionList, currentClassroomList, nextInstitutionList, nextClassroomList] = await Promise.all([
			data.institutionIdList ? this.institutionRepository.find({ instructorList: id }, { populate: ['instructorList'] }) : [],
			data.classroomIdList ? this.classroomRepository.find({ instructorList: id }, { populate: ['instructorList'] }) : [],
			data.institutionIdList ? this.loadInstitutions(data.institutionIdList) : [],
			data.classroomIdList ? this.loadClassrooms(data.classroomIdList) : [],
		]);

		if (data.institutionIdList) {
			for (const institution of currentInstitutionList) {
				if (!nextInstitutionList.some((nextInstitution) => nextInstitution.id === institution.id)) {
					institution.instructorList.remove(instructor);
				}
			}
			for (const institution of nextInstitutionList) {
				institution.instructorList.add(instructor);
			}
		}
		if (data.classroomIdList) {
			for (const classroom of currentClassroomList) {
				if (!nextClassroomList.some((nextClassroom) => nextClassroom.id === classroom.id)) {
					classroom.instructorList.remove(instructor);
				}
			}
			for (const classroom of nextClassroomList) {
				classroom.instructorList.add(instructor);
			}
		}

		await this.instructorRepository.getEntityManager().flush();
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