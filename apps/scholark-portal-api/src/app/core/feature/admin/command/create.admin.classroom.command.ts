import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { Classroom } from '../../education/model/classroom.entity';
import { Course } from '../../education/model/course.entity';
import { EducationCatalogStatus } from '../../education/model/education.catalog.status';
import { Institution } from '../../education/model/institution.entity';
import { Instructor } from '../../education/model/instructor.entity';
import { TaxonomyTerm } from '../../taxonomy/model/taxonomy.term.entity';

export interface CreateAdminClassroomCommandData {
	code: string;
	courseIdList?: string[];
	description?: string;
	institutionId: string;
	instructorIdList?: string[];
	name: string;
	slug: string;
	summary?: string;
	taxonomyTermIdList?: string[];
}

@Injectable()
export class CreateAdminClassroomCommand {

	constructor(
		@InjectRepository(Classroom)
		private readonly classroomRepository: EntityRepository<Classroom>,
		@InjectRepository(Course)
		private readonly courseRepository: EntityRepository<Course>,
		@InjectRepository(Institution)
		private readonly institutionRepository: EntityRepository<Institution>,
		@InjectRepository(Instructor)
		private readonly instructorRepository: EntityRepository<Instructor>,
		@InjectRepository(TaxonomyTerm)
		private readonly taxonomyTermRepository: EntityRepository<TaxonomyTerm>,
	) {}

	async execute(data: CreateAdminClassroomCommandData): Promise<Classroom> {
		const institution = await this.institutionRepository.findOne({ id: data.institutionId });
		if (!institution) {
			throw new NotFoundException('Institution not found.');
		}
		if (institution.status !== EducationCatalogStatus.ACTIVE) {
			throw new ConflictException('An active classroom must belong to an active institution.');
		}

		const slug = data.slug.trim();
		const code = data.code.trim();
		if (await this.classroomRepository.findOne({ slug })) {
			throw new ConflictException('A classroom with this slug already exists.');
		}
		if (await this.classroomRepository.findOne({ institution: institution.id, code })) {
			throw new ConflictException('A classroom with this code already exists for this institution.');
		}

		const classroom = this.classroomRepository.create({
			code,
			description: data.description?.trim() || undefined,
			institution,
			name: data.name.trim(),
			slug,
			status: EducationCatalogStatus.ACTIVE,
			summary: data.summary?.trim() || undefined,
		});
		const { courseList, instructorList, taxonomyTermList } = await this.resolveAssociations(
			data.courseIdList ?? [],
			data.instructorIdList ?? [],
			data.taxonomyTermIdList ?? [],
			institution.id!,
			classroom.status,
		);
		classroom.courseList.set(courseList);
		classroom.instructorList.set(instructorList);
		classroom.taxonomyTermList.set(taxonomyTermList);

		const entityManager = this.classroomRepository.getEntityManager();
		entityManager.persist(classroom);
		await entityManager.flush();

		return classroom;
	}

	private async resolveAssociations(
		courseIdList: string[],
		instructorIdList: string[],
		taxonomyTermIdList: string[],
		institutionId: string,
		status: EducationCatalogStatus,
	): Promise<{ courseList: Course[]; instructorList: Instructor[]; taxonomyTermList: TaxonomyTerm[] }> {
		const [courseList, instructorList, taxonomyTermList] = await Promise.all([
			this.courseRepository.find({ id: { $in: [...new Set(courseIdList)] } }),
			this.instructorRepository.find({ id: { $in: [...new Set(instructorIdList)] } }),
			this.taxonomyTermRepository.find({ id: { $in: [...new Set(taxonomyTermIdList)] } }),
		]);
		if (courseList.length !== new Set(courseIdList).size
			|| instructorList.length !== new Set(instructorIdList).size
			|| taxonomyTermList.length !== new Set(taxonomyTermIdList).size) {
			throw new NotFoundException('One or more selected classroom associations were not found.');
		}
		if (courseList.some((course) => course.institution.id !== institutionId)) {
			throw new ConflictException('Classroom courses must belong to the selected institution.');
		}
		if (status === EducationCatalogStatus.ACTIVE && courseList.some((course) => course.status !== EducationCatalogStatus.ACTIVE)) {
			throw new ConflictException('An active classroom can only include active courses.');
		}

		return { courseList, instructorList, taxonomyTermList };
	}

}