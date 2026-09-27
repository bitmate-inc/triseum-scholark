import { Button } from '@repo/ui/button';
import {
	AlertCircle,
	ArrowLeft,
	Check,
	ChevronLeft,
	ChevronRight,
	ExternalLink,
	GraduationCap,
	Pencil,
	Plus,
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
	createInstructor,
	type CreateInstructorInput,
	getAllClassrooms,
	getAllInstitutions,
	getInstructor,
	getInstructorList,
	type Institution,
	type Instructor,
	type InstructorListResponse,
	type InstructorProfile,
	updateInstructor,
} from '../../lib/admin-api';

const pageSize = 10;

export function InstructorListPage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const institutionId = searchParams.get('institutionId') ?? '';
	const [search, setSearch] = useState('');
	const [offset, setOffset] = useState(0);
	const [reloadKey, setReloadKey] = useState(0);
	const [isCreateOpen, setCreateOpen] = useState(false);
	const [result, setResult] = useState<InstructorListResponse>();
	const [error, setError] = useState<string>();
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(undefined);
		getInstructorList(search, offset, institutionId, controller.signal)
			.then(setResult)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Instructors could not be loaded.');
			})
			.finally(() => setLoading(false));

		return () => controller.abort();
	}, [institutionId, offset, reloadKey, search]);

	const totalItemCount = result?.totalItemCount ?? 0;
	const firstItem = totalItemCount === 0 ? 0 : offset + 1;
	const lastItem = Math.min(offset + pageSize, totalItemCount);

	return (
		<section className="page-content" aria-labelledby="page-title">
			<div className="page-heading">
				<div>
					<p className="eyebrow">Education</p>
					<h1 id="page-title">Instructors</h1>
					<p className="page-description">Review instructor records and their institution and classroom memberships.</p>
				</div>
				<div className="institution-heading-actions">
					<Button className="refresh-button" onClick={() => setCreateOpen(!isCreateOpen)} size="sm" type="button" variant={isCreateOpen ? 'outline' : 'default'}>
						{isCreateOpen ? <X size={15}/> : <Plus size={15}/>} {isCreateOpen ? 'Cancel' : 'Add instructor'}
					</Button>
					<Button className="refresh-button" onClick={() => setReloadKey(reloadKey + 1)} size="sm" type="button" variant="outline">
						<RefreshCw size={15}/> Refresh
					</Button>
				</div>
			</div>
			{isCreateOpen && (
				<InstructorForm
					initialInstitutionId={institutionId || undefined}
					onCancel={() => setCreateOpen(false)}
					onSubmit={async (input) => {
						const instructor = await createInstructor(input);
						setCreateOpen(false);
						navigate(`/instructors/${instructor.id}`);
					}}
					submitLabel="Create instructor"
				/>
			)}
			{institutionId && <p className="filter-context">Filtered by institution <Link to={`/institutions/${institutionId}`}>view institution <ExternalLink size={13}/></Link></p>}
			<div className="table-toolbar">
				<label className="search-field">
					<Search aria-hidden="true" size={17}/>
					<input aria-label="Search instructors" onChange={(event) => {
						setSearch(event.target.value);
						setOffset(0);
					}} placeholder="Search instructors" value={search}/>
				</label>
			</div>
			<div className="table-frame">
				<div className="institution-table-header classroom-table-header">
					<span>Instructor</span><span>Slug</span><span>Profile</span><span/>
				</div>
				{error && <div className="inline-error" role="alert"><AlertCircle size={17}/><span>{error}</span><Button onClick={() => setReloadKey(reloadKey + 1)} size="sm" variant="outline">Try again</Button></div>}
				{isLoading && <div aria-label="Loading instructors" className="table-loading"><span/><span/><span/><span/></div>}
				{!isLoading && !error && result?.instructorList.length === 0 && <div className="empty-state"><div className="empty-mark"><Users size={20}/></div><strong>No instructors found</strong><p>Try a different search or institution.</p></div>}
				{!isLoading && !error && result && result.instructorList.length > 0 && <div className="institution-rows">{result.instructorList.map((instructor) => <InstructorRow instructor={instructor} key={instructor.id}/>)}</div>}
			</div>
			<div className="table-pagination">
				<span>{totalItemCount === 0 ? 'No instructors' : `Showing ${firstItem}–${lastItem} of ${totalItemCount}`}</span>
				<div>
					<Button aria-label="Previous page" disabled={offset === 0 || isLoading} onClick={() => setOffset(Math.max(0, offset - pageSize))} size="icon" variant="outline"><ChevronLeft size={16}/></Button>
					<Button aria-label="Next page" disabled={offset + pageSize >= totalItemCount || isLoading} onClick={() => setOffset(offset + pageSize)} size="icon" variant="outline"><ChevronRight size={16}/></Button>
				</div>
			</div>
		</section>
	);
}

function InstructorRow({ instructor }: { instructor: Instructor }) {
	return (
		<div className="institution-row classroom-row">
			<div className="institution-name-cell">
				<div className="institution-row-mark"><Users size={17}/></div>
				<div><Link to={`/instructors/${instructor.id}`}>{instructor.name}</Link><span>{instructor.slug}</span></div>
			</div>
			<span className="institution-slug">{instructor.slug}</span>
			<span className="instructor-profile-label">Instructor profile</span>
			<Link aria-label={`Open ${instructor.name}`} className="row-open" to={`/instructors/${instructor.id}`}><ExternalLink size={15}/></Link>
		</div>
	);
}

export function InstructorDetailPage() {
	const { id = '' } = useParams();
	const [instructor, setInstructor] = useState<InstructorProfile>();
	const [error, setError] = useState<string>();

	useEffect(() => {
		const controller = new AbortController();
		setInstructor(undefined);
		setError(undefined);
		getInstructor(id, controller.signal)
			.then(setInstructor)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Instructor details could not be loaded.');
			});

		return () => controller.abort();
	}, [id]);

	return (
		<section className="page-content" aria-labelledby="page-title">
			<Link className="back-link" to="/instructors"><ArrowLeft size={15}/> Instructors</Link>
			{error && <div className="detail-error" role="alert"><AlertCircle size={18}/>{error}</div>}
			{!error && !instructor && <div className="detail-loading">Loading instructor...</div>}
			{instructor && <InstructorDetails instructor={instructor}/>}
		</section>
	);
}

function InstructorDetails({ instructor }: { instructor: InstructorProfile }) {
	const [isEditing, setEditing] = useState(false);
	const [currentInstructor, setCurrentInstructor] = useState(instructor);

	return (
		<>
			<div className="detail-heading">
				<div className="detail-mark"><Users size={22}/></div>
				<div>
					<p className="eyebrow">Education / Instructors</p>
					<h1 id="page-title">{currentInstructor.name}</h1>
					<p className="page-description">{currentInstructor.slug}</p>
				</div>
				{!isEditing && <Button className="refresh-button" onClick={() => setEditing(true)} size="sm" type="button" variant="outline"><Pencil size={14}/> Edit</Button>}
			</div>
			{isEditing && (
				<InstructorForm
					instructor={currentInstructor}
					onCancel={() => setEditing(false)}
					onSubmit={async (input) => {
						setCurrentInstructor(await updateInstructor(currentInstructor.id, input));
						setEditing(false);
					}}
					submitLabel="Save changes"
				/>
			)}
			<div className="detail-section">
				<h2>Instructor profile</h2>
				<dl className="detail-grid">
					<div><dt>Name</dt><dd>{currentInstructor.name}</dd></div>
					<div><dt>Slug</dt><dd>{currentInstructor.slug}</dd></div>
				</dl>
			</div>
			<div className="detail-section">
				<h2><GraduationCap size={15}/> Institutions</h2>
				{currentInstructor.institutionList.length > 0 ? <ul className="related-record-list">{currentInstructor.institutionList.map((institution) => <li key={institution.id}><Link to={`/institutions/${institution.id}`}>{institution.name}</Link><small>{institution.slug}</small></li>)}</ul> : <p>No institution memberships.</p>}
			</div>
			<div className="detail-section">
				<h2><GraduationCap size={15}/> Classrooms</h2>
				{currentInstructor.classroomList.length > 0 ? <ul className="related-record-list">{currentInstructor.classroomList.map((classroom) => <li key={classroom.id}><Link to={`/classrooms/${classroom.id}`}>{classroom.name}</Link><small>{classroom.code} · {classroom.institution.name}</small></li>)}</ul> : <p>No classroom memberships.</p>}
			</div>
		</>
	);
}

function InstructorForm({
	instructor,
	initialInstitutionId,
	onCancel,
	onSubmit,
	submitLabel,
}: {
	instructor?: InstructorProfile;
	initialInstitutionId?: string;
	onCancel: () => void;
	onSubmit: (input: CreateInstructorInput) => Promise<void>;
	submitLabel: string;
}) {
	const [institutions, setInstitutions] = useState<Institution[]>([]);
	const [classrooms, setClassrooms] = useState<Classroom[]>([]);
	const [institutionIdList, setInstitutionIdList] = useState(instructor?.institutionList.map(({ id }) => id) ?? (initialInstitutionId ? [initialInstitutionId] : []));
	const [classroomIdList, setClassroomIdList] = useState(instructor?.classroomList.map(({ id }) => id) ?? []);
	const [name, setName] = useState(instructor?.name ?? '');
	const [slug, setSlug] = useState(instructor?.slug ?? '');
	const [slugEdited, setSlugEdited] = useState(Boolean(instructor));
	const [error, setError] = useState<string>();
	const [isLoadingReferences, setLoadingReferences] = useState(true);
	const [isSaving, setSaving] = useState(false);

	useEffect(() => {
		const controller = new AbortController();
		Promise.all([getAllInstitutions(controller.signal), getAllClassrooms(controller.signal)])
			.then(([institutionList, classroomList]) => {
				setInstitutions(institutionList);
				setClassrooms(classroomList);
			})
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Instructor memberships could not be loaded.');
			})
			.finally(() => setLoadingReferences(false));

		return () => controller.abort();
	}, []);

	function selectedIds(event: ChangeEvent<HTMLSelectElement>): string[] {
		return Array.from(event.target.selectedOptions, (option) => option.value);
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
		event.preventDefault();
		setError(undefined);
		setSaving(true);
		try {
			await onSubmit({
				classroomIdList,
				institutionIdList,
				name: name.trim(),
				slug: slug.trim(),
			});
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : 'Instructor could not be saved.');
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
				<label>Slug<input aria-label="Instructor slug" maxLength={160} onChange={(event) => {
					setSlugEdited(true);
					setSlug(event.target.value.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, ''));
				}} pattern="[a-z0-9]+(-[a-z0-9]+)*" required value={slug}/></label>
				<label>Institutions<select aria-label="Institutions" disabled={isLoadingReferences} multiple onChange={(event) => setInstitutionIdList(selectedIds(event))} size={5} value={institutionIdList}>
					{institutions.map((institution) => <option key={institution.id} value={institution.id}>{institution.name}{institution.status === 'inactive' ? ' (inactive)' : ''}</option>)}
				</select></label>
				<label>Classrooms<select aria-label="Classrooms" disabled={isLoadingReferences} multiple onChange={(event) => setClassroomIdList(selectedIds(event))} size={5} value={classroomIdList}>
					{classrooms.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.name} ({classroom.institution.name})</option>)}
				</select></label>
			</div>
			{error && <div className="institution-form-error" role="alert"><AlertCircle size={16}/>{error}</div>}
			<div className="institution-form-actions">
				<Button disabled={isSaving} onClick={onCancel} size="sm" type="button" variant="outline"><X size={14}/> Cancel</Button>
				<Button disabled={isSaving || isLoadingReferences} size="sm" type="submit"><Check size={14}/>{isSaving ? 'Saving...' : submitLabel}</Button>
			</div>
		</form>
	);
}