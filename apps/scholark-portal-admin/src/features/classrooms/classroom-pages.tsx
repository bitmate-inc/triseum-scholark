import { Button } from '@repo/ui/button';
import {
	AlertCircle,
	ArrowLeft,
	BookOpen,
	Check,
	ChevronLeft,
	ChevronRight,
	ExternalLink,
	Gamepad2,
	GraduationCap,
	Pencil,
	Plus,
	Power,
	RefreshCw,
	Search,
	Users,
	X,
} from 'lucide-react';
import {
	type ChangeEvent,
	type FormEvent,
	useEffect,
	useState
} from 'react';
import {
	Link,
	useNavigate,
	useParams,
	useSearchParams
} from 'react-router-dom';

import {
	type Classroom,
	type ClassroomListResponse,
	type Course,
	createClassroom,
	type CreateClassroomInput,
	getAllCourses,
	getAllInstitutions,
	getAllInstructors,
	getAllTaxonomyTerms,
	getClassroom,
	getClassroomList,
	type Institution,
	type Instructor,
	type TaxonomyTerm,
	updateClassroom,
} from '../../lib/admin-api';

const pageSize = 10;

export function ClassroomListPage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const institutionId = searchParams.get('institutionId') ?? '';
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [offset, setOffset] = useState(0);
	const [reloadKey, setReloadKey] = useState(0);
	const [isCreateOpen, setCreateOpen] = useState(false);
	const [result, setResult] = useState<ClassroomListResponse>();
	const [error, setError] = useState<string>();
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(undefined);
		getClassroomList(search, offset, statusFilter, institutionId, controller.signal)
			.then(setResult)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Classrooms could not be loaded.');
			})
			.finally(() => setLoading(false));

		return () => controller.abort();
	}, [institutionId, offset, reloadKey, search, statusFilter]);

	const totalItemCount = result?.totalItemCount ?? 0;
	const firstItem = totalItemCount === 0 ? 0 : offset + 1;
	const lastItem = Math.min(offset + pageSize, totalItemCount);

	return (
		<section className="page-content" aria-labelledby="page-title">
			<div className="page-heading">
				<div>
					<p className="eyebrow">Education</p>
					<h1 id="page-title">Classrooms</h1>
					<p className="page-description">Review classroom records, institutional links, and portal status.</p>
				</div>
				<div className="institution-heading-actions">
					<Button className="refresh-button" onClick={() => setCreateOpen(!isCreateOpen)} size="sm" type="button" variant={isCreateOpen ? 'outline' : 'default'}>
						{isCreateOpen ? <X size={15}/> : <Plus size={15}/>} {isCreateOpen ? 'Cancel' : 'Add classroom'}
					</Button>
					<Button className="refresh-button" onClick={() => setReloadKey(reloadKey + 1)} size="sm" type="button" variant="outline">
						<RefreshCw size={15}/> Refresh
					</Button>
				</div>
			</div>
			{isCreateOpen && (
				<ClassroomForm
					initialInstitutionId={institutionId || undefined}
					onCancel={() => setCreateOpen(false)}
					onSubmit={async (input) => {
						const classroom = await createClassroom(input);
						setCreateOpen(false);
						navigate(`/classrooms/${classroom.id}`);
					}}
					submitLabel="Create classroom"
				/>
			)}
			{institutionId && <p className="filter-context">Filtered by institution <Link to={`/institutions/${institutionId}`}>view institution <ExternalLink size={13}/></Link></p>}
			<div className="table-toolbar">
				<label className="search-field">
					<Search aria-hidden="true" size={17}/>
					<input aria-label="Search classrooms" onChange={(event) => {
						setSearch(event.target.value);
						setOffset(0);
					}} placeholder="Search classrooms" value={search}/>
				</label>
				<label className="status-filter">
					<span>Status</span>
					<select aria-label="Filter by status" onChange={(event) => {
						setStatusFilter(event.target.value);
						setOffset(0);
					}} value={statusFilter}>
						<option value="">All statuses</option>
						<option value="active">Active</option>
						<option value="inactive">Inactive</option>
					</select>
				</label>
			</div>
			<div className="table-frame">
				<div className="institution-table-header classroom-table-header">
					<span>Classroom</span><span>Institution</span><span>Status</span><span/>
				</div>
				{error && (
					<div className="inline-error" role="alert">
						<AlertCircle size={17}/><span>{error}</span>
						<Button onClick={() => setReloadKey(reloadKey + 1)} size="sm" variant="outline">Try again</Button>
					</div>
				)}
				{isLoading && <div aria-label="Loading classrooms" className="table-loading"><span/><span/><span/><span/></div>}
				{!isLoading && !error && result?.classroomList.length === 0 && (
					<div className="empty-state">
						<div className="empty-mark"><GraduationCap size={20}/></div>
						<strong>No classrooms found</strong>
						<p>Try a different search or status filter.</p>
					</div>
				)}
				{!isLoading && !error && result && result.classroomList.length > 0 && (
					<div className="institution-rows">
						{result.classroomList.map((classroom) => <ClassroomRow classroom={classroom} key={classroom.id}/>) }
					</div>
				)}
			</div>
			<div className="table-pagination">
				<span>{totalItemCount === 0 ? 'No classrooms' : `Showing ${firstItem}–${lastItem} of ${totalItemCount}`}</span>
				<div>
					<Button aria-label="Previous page" disabled={offset === 0 || isLoading} onClick={() => setOffset(Math.max(0, offset - pageSize))} size="icon" variant="outline"><ChevronLeft size={16}/></Button>
					<Button aria-label="Next page" disabled={offset + pageSize >= totalItemCount || isLoading} onClick={() => setOffset(offset + pageSize)} size="icon" variant="outline"><ChevronRight size={16}/></Button>
				</div>
			</div>
		</section>
	);
}

function ClassroomRow({ classroom }: { classroom: Classroom }) {
	return (
		<div className="institution-row classroom-row">
			<div className="institution-name-cell">
				<div className="institution-row-mark"><GraduationCap size={17}/></div>
				<div><Link to={`/classrooms/${classroom.id}`}>{classroom.name}</Link><span>{classroom.code} · {classroom.slug}</span></div>
			</div>
			<Link className="classroom-institution-link" to={`/institutions/${classroom.institution.id}`}>{classroom.institution.name}</Link>
			<span className={`status-badge status-${classroom.status}`}>{classroom.status}</span>
			<Link aria-label={`Open ${classroom.name}`} className="row-open" to={`/classrooms/${classroom.id}`}><ExternalLink size={15}/></Link>
		</div>
	);
}

export function ClassroomDetailPage() {
	const { id = '' } = useParams();
	const [classroom, setClassroom] = useState<Classroom>();
	const [error, setError] = useState<string>();

	useEffect(() => {
		const controller = new AbortController();
		setClassroom(undefined);
		setError(undefined);
		getClassroom(id, controller.signal)
			.then(setClassroom)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Classroom details could not be loaded.');
			});

		return () => controller.abort();
	}, [id]);

	return (
		<section className="page-content" aria-labelledby="page-title">
			<Link className="back-link" to="/classrooms"><ArrowLeft size={15}/> Classrooms</Link>
			{error && <div className="detail-error" role="alert"><AlertCircle size={18}/>{error}</div>}
			{!error && !classroom && <div className="detail-loading">Loading classroom...</div>}
			{classroom && <ClassroomDetails classroom={classroom} onClassroomUpdate={setClassroom}/>}
		</section>
	);
}

function ClassroomDetails({
	classroom,
	onClassroomUpdate,
}: {
	classroom: Classroom;
	onClassroomUpdate: (classroom: Classroom) => void;
}) {
	const [isEditing, setEditing] = useState(false);
	const [statusError, setStatusError] = useState<string>();
	const [isUpdatingStatus, setUpdatingStatus] = useState(false);

	async function updateStatus(status: Classroom['status']): Promise<void> {
		setUpdatingStatus(true);
		setStatusError(undefined);
		try {
			onClassroomUpdate(await updateClassroom(classroom.id, { status }));
		} catch (requestError) {
			setStatusError(requestError instanceof Error ? requestError.message : 'Classroom status could not be updated.');
		} finally {
			setUpdatingStatus(false);
		}
	}

	return (
		<>
			<div className="detail-heading">
				<div className="detail-mark"><GraduationCap size={22}/></div>
				<div>
					<p className="eyebrow">Education / Classrooms</p>
					<h1 id="page-title">{classroom.name}</h1>
					<p className="page-description">{classroom.code} · {classroom.slug}</p>
				</div>
				<div className="institution-detail-actions">
					<span className={`status-badge status-${classroom.status}`}>{classroom.status}</span>
					{!isEditing && (
						<>
							<Button className="refresh-button" onClick={() => setEditing(true)} size="sm" type="button" variant="outline"><Pencil size={14}/> Edit</Button>
							<Button className="refresh-button" disabled={isUpdatingStatus} onClick={() => updateStatus(classroom.status === 'active' ? 'inactive' : 'active')} size="sm" type="button" variant="outline"><Power size={14}/>{classroom.status === 'active' ? 'Deactivate' : 'Activate'}</Button>
						</>
					)}
				</div>
			</div>
			{statusError && <div className="detail-error" role="alert"><AlertCircle size={17}/>{statusError}</div>}
			{isEditing && (
				<ClassroomForm
					classroom={classroom}
					onCancel={() => setEditing(false)}
					onSubmit={async (input) => {
						onClassroomUpdate(await updateClassroom(classroom.id, input));
						setEditing(false);
					}}
					submitLabel="Save changes"
				/>
			)}
			<div className="detail-section">
				<h2>Classroom profile</h2>
				<dl className="detail-grid">
					<div><dt>Institution</dt><dd><Link to={`/institutions/${classroom.institution.id}`}>{classroom.institution.name}<ExternalLink size={13}/></Link></dd></div>
					<div><dt>Status</dt><dd>{classroom.status}</dd></div>
					<div><dt>Classroom code</dt><dd>{classroom.code}</dd></div>
					<div><dt>Slug</dt><dd>{classroom.slug}</dd></div>
					<div><dt>Summary</dt><dd>{classroom.summary || 'No summary provided.'}</dd></div>
					<div><dt>Description</dt><dd>{classroom.description || 'No description provided.'}</dd></div>
				</dl>
				<div className="learning-space-links">
					<Link className="related-section-link" to={`/classroom-games?classroomId=${encodeURIComponent(classroom.id)}`}><Gamepad2 size={16}/> View classroom games</Link>
				</div>
			</div>
			<div className="detail-section">
				<h2><BookOpen size={15}/> Courses</h2>
				{classroom.courseList.length > 0 ? <ul className="related-record-list">{classroom.courseList.map((course) => <li key={course.id}><Link to={`/courses/${course.id}`}>{course.name}</Link><small>{course.code} · {course.slug}</small></li>)}</ul> : <p>No courses are linked to this classroom.</p>}
			</div>
			<div className="detail-section">
				<h2><Users size={15}/> Instructors</h2>
				{classroom.instructorList.length > 0 ? <ul className="related-record-list">{classroom.instructorList.map((instructor) => <li key={instructor.id}><Link to={`/instructors/${instructor.id}`}>{instructor.name}</Link><small>{instructor.slug}</small></li>)}</ul> : <p>No instructors are linked to this classroom.</p>}
			</div>
			<div className="detail-section">
				<h2>Taxonomy</h2>
				{classroom.taxonomyTermList.length > 0 ? <ul className="related-record-list">{classroom.taxonomyTermList.map((term) => <li key={term.id}><span>{term.label}</span><small>{term.type} · {term.slug}</small></li>)}</ul> : <p>No taxonomy terms are assigned to this classroom.</p>}
			</div>
		</>
	);
}

function ClassroomForm({
	classroom,
	initialInstitutionId,
	onCancel,
	onSubmit,
	submitLabel,
}: {
	classroom?: Classroom;
	initialInstitutionId?: string;
	onCancel: () => void;
	onSubmit: (input: CreateClassroomInput) => Promise<void>;
	submitLabel: string;
}) {
	const [institutions, setInstitutions] = useState<Institution[]>([]);
	const [courses, setCourses] = useState<Course[]>([]);
	const [instructors, setInstructors] = useState<Instructor[]>([]);
	const [taxonomyTerms, setTaxonomyTerms] = useState<TaxonomyTerm[]>([]);
	const [institutionId, setInstitutionId] = useState(classroom?.institution.id ?? initialInstitutionId ?? '');
	const [courseIdList, setCourseIdList] = useState(classroom?.courseList.map((course) => course.id) ?? []);
	const [instructorIdList, setInstructorIdList] = useState(classroom?.instructorList.map((instructor) => instructor.id) ?? []);
	const [taxonomyTermIdList, setTaxonomyTermIdList] = useState(classroom?.taxonomyTermList.map((term) => term.id) ?? []);
	const [name, setName] = useState(classroom?.name ?? '');
	const [code, setCode] = useState(classroom?.code ?? '');
	const [slug, setSlug] = useState(classroom?.slug ?? '');
	const [slugEdited, setSlugEdited] = useState(Boolean(classroom));
	const [summary, setSummary] = useState(classroom?.summary ?? '');
	const [description, setDescription] = useState(classroom?.description ?? '');
	const [error, setError] = useState<string>();
	const [isLoadingReferences, setLoadingReferences] = useState(true);
	const [isLoadingCourses, setLoadingCourses] = useState(false);
	const [isSaving, setSaving] = useState(false);

	useEffect(() => {
		const controller = new AbortController();
		Promise.all([
			getAllInstitutions(controller.signal),
			getAllInstructors(controller.signal),
			getAllTaxonomyTerms(controller.signal),
		])
			.then(([institutionList, instructorList, taxonomyTermList]) => {
				setInstitutions(institutionList);
				setInstructors(instructorList);
				setTaxonomyTerms(taxonomyTermList);
				setInstitutionId((current) => current || initialInstitutionId || institutionList.find((institution) => institution.status === 'active')?.id || '');
			})
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Classroom associations could not be loaded.');
			})
			.finally(() => setLoadingReferences(false));

		return () => controller.abort();
	}, [initialInstitutionId]);

	useEffect(() => {
		if (!institutionId) {
			setCourses([]);
			return;
		}

		const controller = new AbortController();
		setLoadingCourses(true);
		getAllCourses(institutionId, controller.signal)
			.then(setCourses)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Courses could not be loaded.');
			})
			.finally(() => setLoadingCourses(false));

		return () => controller.abort();
	}, [institutionId]);

	const availableInstitutions = classroom?.status === 'inactive'
		? institutions
		: institutions.filter((institution) => institution.status === 'active');
	const availableCourses = classroom?.status === 'inactive'
		? courses
		: courses.filter((course) => course.status === 'active');

	function selectedIds(event: ChangeEvent<HTMLSelectElement>): string[] {
		return Array.from(event.target.selectedOptions, (option) => option.value);
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
		event.preventDefault();
		setError(undefined);
		setSaving(true);
		try {
			await onSubmit({
				code: code.trim(),
				courseIdList,
				description: description.trim() || undefined,
				institutionId,
				instructorIdList,
				name: name.trim(),
				slug: slug.trim(),
				summary: summary.trim() || undefined,
				taxonomyTermIdList,
			});
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : 'Classroom could not be saved.');
		} finally {
			setSaving(false);
		}
	}

	return (
		<form className="institution-form" onSubmit={handleSubmit}>
			<div className="institution-form-fields">
				<label>Name<input autoComplete="off" maxLength={160} onChange={(event) => {
					const value = event.target.value;
					setName(value);
					if (!slugEdited) {
						setSlug(value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
					}
				}} required value={name}/></label>
				<label>Classroom code<input maxLength={100} onChange={(event) => setCode(event.target.value)} required value={code}/></label>
				<label>Slug<input aria-label="Classroom slug" maxLength={160} onChange={(event) => {
					setSlugEdited(true);
					setSlug(event.target.value.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, ''));
				}} pattern="[a-z0-9]+(-[a-z0-9]+)*" required value={slug}/></label>
				<label>Institution<select onChange={(event) => {
					setInstitutionId(event.target.value);
					setCourseIdList([]);
				}} required value={institutionId}>
					<option disabled value="">Select an institution</option>
					{availableInstitutions.map((institution) => <option key={institution.id} value={institution.id}>{institution.name}{institution.status === 'inactive' ? ' (inactive)' : ''}</option>)}
				</select></label>
				<label>Courses<select aria-label="Courses" disabled={isLoadingCourses || !institutionId} multiple onChange={(event) => setCourseIdList(selectedIds(event))} size={4} value={courseIdList}>
					{availableCourses.map((course) => <option key={course.id} value={course.id}>{course.name} ({course.code})</option>)}
				</select></label>
				<label>Instructors<select aria-label="Instructors" disabled={isLoadingReferences} multiple onChange={(event) => setInstructorIdList(selectedIds(event))} size={4} value={instructorIdList}>
					{instructors.map((instructor) => <option key={instructor.id} value={instructor.id}>{instructor.name}</option>)}
				</select></label>
				<label>Taxonomy terms<select aria-label="Taxonomy terms" disabled={isLoadingReferences} multiple onChange={(event) => setTaxonomyTermIdList(selectedIds(event))} size={4} value={taxonomyTermIdList}>
					{taxonomyTerms.map((term) => <option key={term.id} value={term.id}>{term.label} ({term.type})</option>)}
				</select></label>
				<label>Summary<input maxLength={500} onChange={(event) => setSummary(event.target.value)} value={summary}/></label>
				<label className="institution-form-description">Description<textarea maxLength={10000} onChange={(event) => setDescription(event.target.value)} rows={3} value={description}/></label>
			</div>
			{error && <div className="institution-form-error" role="alert"><AlertCircle size={16}/>{error}</div>}
			<div className="institution-form-actions">
				<Button disabled={isSaving} onClick={onCancel} size="sm" type="button" variant="outline"><X size={14}/> Cancel</Button>
				<Button disabled={isSaving || isLoadingReferences || isLoadingCourses || !institutionId} size="sm" type="submit"><Check size={14}/>{isSaving ? 'Saving...' : submitLabel}</Button>
			</div>
		</form>
	);
}