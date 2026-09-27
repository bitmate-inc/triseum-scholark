import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
	BadRequestException,
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

export interface UpdateAdminClassroomCommandData {
	code?: string;
	courseIdList?: string[];
	description?: string;
	institutionId?: string;
	instructorIdList?: string[];
	name?: string;
	slug?: string;
	status?: EducationCatalogStatus;
	summary?: string;
	taxonomyTermIdList?: string[];
}

@Injectable()
export class UpdateAdminClassroomCommand {

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

	async execute(id: string, data: UpdateAdminClassroomCommandData): Promise<Classroom> {
		if (Object.keys(data).length === 0) {
			throw new BadRequestException('At least one classroom field must be provided.');
		}

		const classroom = await this.classroomRepository.findOne(
			{ id },
			{ populate: ['institution', 'courseList', 'instructorList', 'taxonomyTermList'] },
		);
		if (!classroom) {
			throw new NotFoundException('Classroom not found.');
		}

		const institution = data.institutionId
			? await this.institutionRepository.findOne({ id: data.institutionId })
			: classroom.institution;
		if (!institution) {
			throw new NotFoundException('Institution not found.');
		}

		const nextStatus = data.status ?? classroom.status;
		if (nextStatus === EducationCatalogStatus.ACTIVE && institution.status !== EducationCatalogStatus.ACTIVE) {
			throw new ConflictException('An active classroom must belong to an active institution.');
		}

		const nextSlug = data.slug?.trim();
		if (nextSlug) {
			const existingClassroom = await this.classroomRepository.findOne({ slug: nextSlug });
			if (existingClassroom && existingClassroom.id !== id) {
				throw new ConflictException('A classroom with this slug already exists.');
			}
			classroom.slug = nextSlug;
		}

		const nextCode = data.code?.trim() ?? classroom.code;
		if (nextCode !== classroom.code || institution.id !== classroom.institution.id) {
			const existingClassroom = await this.classroomRepository.findOne({ institution: institution.id, code: nextCode });
			if (existingClassroom && existingClassroom.id !== id) {
				throw new ConflictException('A classroom with this code already exists for this institution.');
			}
		}

		const courseIdList = data.courseIdList ?? classroom.courseList.getItems().map((course) => course.id!);
		const instructorIdList = data.instructorIdList;
		const taxonomyTermIdList = data.taxonomyTermIdList;
		const [courseList, instructorList, taxonomyTermList] = await Promise.all([
			this.resolveCourses(courseIdList, institution.id!, nextStatus),
			instructorIdList ? this.resolveInstructors(instructorIdList) : undefined,
			taxonomyTermIdList ? this.resolveTaxonomyTerms(taxonomyTermIdList) : undefined,
		]);

		if (typeof data.name !== 'undefined') {
			classroom.name = data.name.trim();
		}
		classroom.code = nextCode;
		classroom.institution = institution;
		if (typeof data.summary !== 'undefined') {
			classroom.summary = data.summary.trim() || undefined;
		}
		if (typeof data.description !== 'undefined') {
			classroom.description = data.description.trim() || undefined;
		}
		classroom.status = nextStatus;
		if (data.courseIdList) {
			classroom.courseList.set(courseList);
		}
		if (instructorList) {
			classroom.instructorList.set(instructorList);
		}
		if (taxonomyTermList) {
			classroom.taxonomyTermList.set(taxonomyTermList);
		}

		await this.classroomRepository.getEntityManager().flush();
		return classroom;
	}

	private async resolveCourses(
		idList: string[],
		institutionId: string,
		status: EducationCatalogStatus,
	): Promise<Course[]> {
		const uniqueIdList = [...new Set(idList)];
		const courseList = await this.courseRepository.find({ id: { $in: uniqueIdList } });
		if (courseList.length !== uniqueIdList.length) {
			throw new NotFoundException('One or more selected courses were not found.');
		}
		if (courseList.some((course) => course.institution.id !== institutionId)) {
			throw new ConflictException('Classroom courses must belong to the selected institution.');
		}
		if (status === EducationCatalogStatus.ACTIVE && courseList.some((course) => course.status !== EducationCatalogStatus.ACTIVE)) {
			throw new ConflictException('An active classroom can only include active courses.');
		}
		return courseList;
	}

	private async resolveInstructors(idList: string[]): Promise<Instructor[]> {
		const uniqueIdList = [...new Set(idList)];
		const instructorList = await this.instructorRepository.find({ id: { $in: uniqueIdList } });
		if (instructorList.length !== uniqueIdList.length) {
			throw new NotFoundException('One or more selected instructors were not found.');
		}
		return instructorList;
	}

	private async resolveTaxonomyTerms(idList: string[]): Promise<TaxonomyTerm[]> {
		const uniqueIdList = [...new Set(idList)];
		const taxonomyTermList = await this.taxonomyTermRepository.find({ id: { $in: uniqueIdList } });
		if (taxonomyTermList.length !== uniqueIdList.length) {
			throw new NotFoundException('One or more selected taxonomy terms were not found.');
		}
		return taxonomyTermList;
	}

}