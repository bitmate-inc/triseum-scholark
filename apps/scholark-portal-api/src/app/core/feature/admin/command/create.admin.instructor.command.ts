import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { Classroom } from '../../education/model/classroom.entity';
import { Institution } from '../../education/model/institution.entity';
import { Instructor } from '../../education/model/instructor.entity';
import { ClassroomRepository } from '../../education/repository/classroom.repository';
import { InstitutionRepository } from '../../education/repository/institution.repository';
import { InstructorRepository } from '../../education/repository/instructor.repository';

export interface CreateAdminInstructorCommandData {
	classroomIdList?: string[];
	institutionIdList?: string[];
	name: string;
	slug: string;
}

@Injectable()
export class CreateAdminInstructorCommand {

	constructor(
		private readonly classroomRepository: ClassroomRepository,
		private readonly institutionRepository: InstitutionRepository,
		private readonly instructorRepository: InstructorRepository,
	) {}

	async execute(data: CreateAdminInstructorCommandData): Promise<Instructor> {
		const slug = data.slug.trim();
		if (await this.instructorRepository.findOneBy({ slug })) {
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

		await this.instructorRepository.save(instructor);

		return instructor;
	}

	private async loadInstitutions(idList: string[]): Promise<Institution[]> {
		const uniqueIdList = [...new Set(idList)];
		const institutionList = await this.institutionRepository.findBy(
			{ id: uniqueIdList },
			{ relations: { instructorList: true } },
		);
		if (institutionList.length !== uniqueIdList.length) {
			throw new NotFoundException('One or more selected institutions were not found.');
		}
		return institutionList;
	}

	private async loadClassrooms(idList: string[]): Promise<Classroom[]> {
		const uniqueIdList = [...new Set(idList)];
		const classroomList = await this.classroomRepository.findBy(
			{ id: uniqueIdList },
			{ relations: { instructorList: true } },
		);
		if (classroomList.length !== uniqueIdList.length) {
			throw new NotFoundException('One or more selected classrooms were not found.');
		}
		return classroomList;
	}

}