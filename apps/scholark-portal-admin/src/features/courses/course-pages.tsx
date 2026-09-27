import { Button } from '@repo/ui/button';
import {
	AlertCircle,
	ArrowLeft,
	BookOpen,
	Check,
	ChevronLeft,
	ChevronRight,
	ExternalLink,
	Pencil,
	Plus,
	Power,
	RefreshCw,
	Search,
	X,
} from 'lucide-react';
import {
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
	type Course,
	type CourseListResponse,
	createCourse,
	type CreateCourseInput,
	getAllInstitutions,
	getCourse,
	getCourseList,
	updateCourse,
} from '../../lib/admin-api';

const pageSize = 10;

export function CourseListPage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const institutionId = searchParams.get('institutionId') ?? '';
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [offset, setOffset] = useState(0);
	const [reloadKey, setReloadKey] = useState(0);
	const [isCreateOpen, setCreateOpen] = useState(false);
	const [result, setResult] = useState<CourseListResponse>();
	const [error, setError] = useState<string>();
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(undefined);
		getCourseList(search, offset, statusFilter, institutionId, controller.signal)
			.then(setResult)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Courses could not be loaded.');
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
					<h1 id="page-title">Courses</h1>
					<p className="page-description">Review course records and their institutional associations.</p>
				</div>
				<div className="institution-heading-actions">
					<Button className="refresh-button" onClick={() => setCreateOpen(!isCreateOpen)} size="sm" type="button" variant={isCreateOpen ? 'outline' : 'default'}>
						{isCreateOpen ? <X size={15}/> : <Plus size={15}/>} {isCreateOpen ? 'Cancel' : 'Add course'}
					</Button>
					<Button className="refresh-button" onClick={() => setReloadKey(reloadKey + 1)} size="sm" type="button" variant="outline">
						<RefreshCw size={15}/> Refresh
					</Button>
				</div>
			</div>
			{isCreateOpen && (
				<CourseForm
					initialInstitutionId={institutionId || undefined}
					onCancel={() => setCreateOpen(false)}
					onSubmit={async (input) => {
						const course = await createCourse(input);
						setCreateOpen(false);
						navigate(`/courses/${course.id}`);
					}}
					submitLabel="Create course"
				/>
			)}
			{institutionId && <p className="filter-context">Filtered by institution <Link to={`/institutions/${institutionId}`}>view institution <ExternalLink size={13}/></Link></p>}
			<div className="table-toolbar">
				<label className="search-field">
					<Search aria-hidden="true" size={17}/>
					<input aria-label="Search courses" onChange={(event) => {
						setSearch(event.target.value);
						setOffset(0);
					}} placeholder="Search courses" value={search}/>
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
					<span>Course</span><span>Institution</span><span>Status</span><span/>
				</div>
				{error && <div className="inline-error" role="alert"><AlertCircle size={17}/><span>{error}</span><Button onClick={() => setReloadKey(reloadKey + 1)} size="sm" variant="outline">Try again</Button></div>}
				{isLoading && <div aria-label="Loading courses" className="table-loading"><span/><span/><span/><span/></div>}
				{!isLoading && !error && result?.courseList.length === 0 && <div className="empty-state"><div className="empty-mark"><BookOpen size={20}/></div><strong>No courses found</strong><p>Try a different search or status filter.</p></div>}
				{!isLoading && !error && result && result.courseList.length > 0 && <div className="institution-rows">{result.courseList.map((course) => <CourseRow course={course} key={course.id}/>)}</div>}
			</div>
			<div className="table-pagination">
				<span>{totalItemCount === 0 ? 'No courses' : `Showing ${firstItem}–${lastItem} of ${totalItemCount}`}</span>
				<div>
					<Button aria-label="Previous page" disabled={offset === 0 || isLoading} onClick={() => setOffset(Math.max(0, offset - pageSize))} size="icon" variant="outline"><ChevronLeft size={16}/></Button>
					<Button aria-label="Next page" disabled={offset + pageSize >= totalItemCount || isLoading} onClick={() => setOffset(offset + pageSize)} size="icon" variant="outline"><ChevronRight size={16}/></Button>
				</div>
			</div>
		</section>
	);
}

function CourseRow({ course }: { course: Course }) {
	return (
		<div className="institution-row classroom-row">
			<div className="institution-name-cell">
				<div className="institution-row-mark"><BookOpen size={17}/></div>
				<div><Link to={`/courses/${course.id}`}>{course.name}</Link><span>{course.code} · {course.slug}</span></div>
			</div>
			<Link className="classroom-institution-link" to={`/institutions/${course.institution.id}`}>{course.institution.name}</Link>
			<span className={`status-badge status-${course.status}`}>{course.status}</span>
			<Link aria-label={`Open ${course.name}`} className="row-open" to={`/courses/${course.id}`}><ExternalLink size={15}/></Link>
		</div>
	);
}

export function CourseDetailPage() {
	const { id = '' } = useParams();
	const [course, setCourse] = useState<Course>();
	const [error, setError] = useState<string>();

	useEffect(() => {
		const controller = new AbortController();
		setCourse(undefined);
		setError(undefined);
		getCourse(id, controller.signal)
			.then(setCourse)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Course details could not be loaded.');
			});

		return () => controller.abort();
	}, [id]);

	return (
		<section className="page-content" aria-labelledby="page-title">
			<Link className="back-link" to="/courses"><ArrowLeft size={15}/> Courses</Link>
			{error && <div className="detail-error" role="alert"><AlertCircle size={18}/>{error}</div>}
			{!error && !course && <div className="detail-loading">Loading course...</div>}
			{course && <CourseDetails course={course} onCourseUpdate={setCourse}/>}
		</section>
	);
}

function CourseDetails({
	course,
	onCourseUpdate,
}: {
	course: Course;
	onCourseUpdate: (course: Course) => void;
}) {
	const [isEditing, setEditing] = useState(false);
	const [statusError, setStatusError] = useState<string>();
	const [isUpdatingStatus, setUpdatingStatus] = useState(false);

	async function updateStatus(status: Course['status']): Promise<void> {
		setUpdatingStatus(true);
		setStatusError(undefined);
		try {
			onCourseUpdate(await updateCourse(course.id, { status }));
		} catch (requestError) {
			setStatusError(requestError instanceof Error ? requestError.message : 'Course status could not be updated.');
		} finally {
			setUpdatingStatus(false);
		}
	}

	return (
		<>
			<div className="detail-heading">
				<div className="detail-mark"><BookOpen size={22}/></div>
				<div>
					<p className="eyebrow">Education / Courses</p>
					<h1 id="page-title">{course.name}</h1>
					<p className="page-description">{course.code} · {course.slug}</p>
				</div>
				<div className="institution-detail-actions">
					<span className={`status-badge status-${course.status}`}>{course.status}</span>
					{!isEditing && (
						<>
							<Button className="refresh-button" onClick={() => setEditing(true)} size="sm" type="button" variant="outline"><Pencil size={14}/> Edit</Button>
							<Button className="refresh-button" disabled={isUpdatingStatus} onClick={() => updateStatus(course.status === 'active' ? 'inactive' : 'active')} size="sm" type="button" variant="outline"><Power size={14}/>{course.status === 'active' ? 'Deactivate' : 'Activate'}</Button>
						</>
					)}
				</div>
			</div>
			{statusError && <div className="detail-error" role="alert"><AlertCircle size={17}/>{statusError}</div>}
			{isEditing && (
				<CourseForm
					course={course}
					onCancel={() => setEditing(false)}
					onSubmit={async (input) => {
						onCourseUpdate(await updateCourse(course.id, input));
						setEditing(false);
					}}
					submitLabel="Save changes"
				/>
			)}
			<div className="detail-section">
				<h2>Course profile</h2>
				<dl className="detail-grid">
					<div><dt>Institution</dt><dd><Link to={`/institutions/${course.institution.id}`}>{course.institution.name}<ExternalLink size={13}/></Link></dd></div>
					<div><dt>Status</dt><dd>{course.status}</dd></div>
					<div><dt>Course code</dt><dd>{course.code}</dd></div>
					<div><dt>Slug</dt><dd>{course.slug}</dd></div>
					<div><dt>Summary</dt><dd>{course.summary || 'No summary provided.'}</dd></div>
					<div><dt>Description</dt><dd>{course.description || 'No description provided.'}</dd></div>
				</dl>
			</div>
		</>
	);
}

function CourseForm({
	course,
	initialInstitutionId,
	onCancel,
	onSubmit,
	submitLabel,
}: {
	course?: Course;
	initialInstitutionId?: string;
	onCancel: () => void;
	onSubmit: (input: CreateCourseInput) => Promise<void>;
	submitLabel: string;
}) {
	const [institutions, setInstitutions] = useState<{ id: string; name: string; status: string }[]>([]);
	const [institutionId, setInstitutionId] = useState(course?.institution.id ?? initialInstitutionId ?? '');
	const [name, setName] = useState(course?.name ?? '');
	const [code, setCode] = useState(course?.code ?? '');
	const [slug, setSlug] = useState(course?.slug ?? '');
	const [slugEdited, setSlugEdited] = useState(Boolean(course));
	const [summary, setSummary] = useState(course?.summary ?? '');
	const [description, setDescription] = useState(course?.description ?? '');
	const [error, setError] = useState<string>();
	const [isSaving, setSaving] = useState(false);

	useEffect(() => {
		const controller = new AbortController();
		getAllInstitutions(controller.signal)
			.then((institutionList) => {
				setInstitutions(institutionList);
				setInstitutionId((current) => current || initialInstitutionId || institutionList.find((institution) => institution.status === 'active')?.id || '');
			})
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Institutions could not be loaded.');
			});

		return () => controller.abort();
	}, [initialInstitutionId]);

	const availableInstitutions = course?.status === 'inactive'
		? institutions
		: institutions.filter((institution) => institution.status === 'active');

	async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
		event.preventDefault();
		setError(undefined);
		setSaving(true);
		try {
			await onSubmit({
				code: code.trim(),
				description: description.trim() || undefined,
				institutionId,
				name: name.trim(),
				slug: slug.trim(),
				summary: summary.trim() || undefined,
			});
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : 'Course could not be saved.');
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
				<label>Course code<input maxLength={100} onChange={(event) => setCode(event.target.value)} required value={code}/></label>
				<label>Slug<input aria-label="Course slug" maxLength={160} onChange={(event) => {
					setSlugEdited(true);
					setSlug(event.target.value.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, ''));
				}} pattern="[a-z0-9]+(-[a-z0-9]+)*" required value={slug}/></label>
				<label>Institution<select onChange={(event) => setInstitutionId(event.target.value)} required value={institutionId}>
					<option disabled value="">Select an institution</option>
					{availableInstitutions.map((institution) => <option key={institution.id} value={institution.id}>{institution.name}{institution.status === 'inactive' ? ' (inactive)' : ''}</option>)}
				</select></label>
				<label>Summary<input maxLength={500} onChange={(event) => setSummary(event.target.value)} value={summary}/></label>
				<label className="institution-form-description">Description<textarea maxLength={10000} onChange={(event) => setDescription(event.target.value)} rows={3} value={description}/></label>
			</div>
			{error && <div className="institution-form-error" role="alert"><AlertCircle size={16}/>{error}</div>}
			<div className="institution-form-actions">
				<Button disabled={isSaving} onClick={onCancel} size="sm" type="button" variant="outline"><X size={14}/> Cancel</Button>
				<Button disabled={isSaving || !institutionId} size="sm" type="submit"><Check size={14}/>{isSaving ? 'Saving...' : submitLabel}</Button>
			</div>
		</form>
	);
}