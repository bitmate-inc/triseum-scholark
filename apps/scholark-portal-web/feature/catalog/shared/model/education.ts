import type { Media } from "../../../media/shared/model/media";
import type { Game, TaxonomyTerm } from "./game";

export type EducationCatalogStatus = "active" | "inactive";

export type Instructor = {
	id: string;
	name: string;
	slug: string;
};

export type Institution = {
	id: string;
	name: string;
	slug: string;
	cover?: Media;
	summary?: string;
	description?: string;
	websiteUrl?: string;
	status: EducationCatalogStatus;
};

export type Course = {
	id: string;
	institution: Institution;
	name: string;
	code: string;
	slug: string;
	cover?: Media;
	summary?: string;
	description?: string;
	status: EducationCatalogStatus;
};

export type Classroom = {
	id: string;
	institution: Institution;
	name: string;
	code: string;
	slug: string;
	cover?: Media;
	summary?: string;
	description?: string;
	status: EducationCatalogStatus;
	courseList: Pick<Course, "id" | "name" | "code" | "slug">[];
	instructorList: Instructor[];
	taxonomyTermList: TaxonomyTerm[];
};

export type ClassroomGame = {
	id: string;
	classroom: Pick<Classroom, "id" | "name" | "slug" | "institution">;
	game: Game;
	contractGameProductId: string;
	designatedPayor: "student" | "institution";
	gameVersionId: string;
	startAt: string;
	endAt: string;
	licenseDurationDays: number;
	createdAt: string;
	updatedAt: string;
};

export type InstitutionListResponse = {
	institutionList: Institution[];
	totalItemCount: number;
};

export type CourseListResponse = {
	courseList: Course[];
	totalItemCount: number;
};

export type ClassroomListResponse = {
	classroomList: Classroom[];
	totalItemCount: number;
};

export type ClassroomGameListResponse = {
	classroomGameList: ClassroomGame[];
	totalItemCount: number;
};

export type ClassroomGameResponse = {
	classroomGame: ClassroomGame;
};

export type EducationListQuery = {
	q?: string;
	limit?: number;
	offset?: number;
	institutionId?: string;
	courseId?: string;
	classroomId?: string;
};

export type AcademicItem = Institution | Course | Classroom;
export type AcademicResource = "institution" | "course" | "classroom";