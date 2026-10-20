import { Button } from '@repo/ui/button';
import {
	AlertCircle,
	ArrowLeft,
	BookOpen,
	Building2,
	Check,
	ChevronLeft,
	ChevronRight,
	ExternalLink,
	Gamepad2,
	GraduationCap,
	Mail,
	Pencil,
	Plus,
	Power,
	RefreshCw,
	Search,
	Users,
	X,
} from 'lucide-react';
import {
	type FormEvent,
	type KeyboardEvent,
	type ReactNode,
	useEffect,
	useState
} from 'react';
import {
	Link,
	useParams,
	useSearchParams
} from 'react-router-dom';

import {
	type Classroom,
	type ClassroomGameListing,
	type Course,
	createInstitution,
	type CreateInstitutionInput,
	getClassroomGameListingList,
	getClassroomList,
	getCourseList,
	getInstitution,
	getInstitutionList,
	getInstructorList,
	type Institution,
	type InstitutionListResponse,
	type InstructorListItem,
	updateInstitution,
} from '../../lib/admin-api';

const pageSize = 10;

type InstitutionTab = 'overview' | 'classrooms' | 'courses' | 'instructors' | 'classroom-games';

const institutionTabList: { id: InstitutionTab; label: string }[] = [
	{ id: 'overview', label: 'Overview' },
	{ id: 'classrooms', label: 'Classrooms' },
	{ id: 'courses', label: 'Courses' },
	{ id: 'instructors', label: 'Instructors' },
	{ id: 'classroom-games', label: 'Classroom games' },
];

const educationStatusOptions = [
	{ label: 'Active', value: 'active' },
	{ label: 'Inactive', value: 'inactive' },
];

interface InstitutionRelatedPage<TItem> {
	itemList: TItem[];
	totalItemCount: number;
}

type InstitutionRelatedPageLoader<TItem> = (
	institutionId: string,
	query: string,
	offset: number,
	status: string,
	signal: AbortSignal,
) => Promise<InstitutionRelatedPage<TItem>>;

function institutionTabFrom(value: string | null): InstitutionTab {
	return institutionTabList.find((tab) => tab.id === value)?.id ?? 'overview';
}

async function loadInstitutionClassrooms(
	institutionId: string,
	query: string,
	offset: number,
	status: string,
	signal: AbortSignal,
): Promise<InstitutionRelatedPage<Classroom>> {
	const result = await getClassroomList(query, offset, status, institutionId, signal);
	return { itemList: result.classroomList, totalItemCount: result.totalItemCount };
}

async function loadInstitutionCourses(
	institutionId: string,
	query: string,
	offset: number,
	status: string,
	signal: AbortSignal,
): Promise<InstitutionRelatedPage<Course>> {
	const result = await getCourseList(query, offset, status, institutionId, signal);
	return { itemList: result.courseList, totalItemCount: result.totalItemCount };
}

async function loadInstitutionInstructors(
	institutionId: string,
	query: string,
	offset: number,
	_status: string,
	signal: AbortSignal,
): Promise<InstitutionRelatedPage<InstructorListItem>> {
	const result = await getInstructorList(query, offset, institutionId, signal);
	return { itemList: result.instructorList, totalItemCount: result.totalItemCount };
}

async function loadInstitutionClassroomGames(
	institutionId: string,
	query: string,
	offset: number,
	_status: string,
	signal: AbortSignal,
): Promise<InstitutionRelatedPage<ClassroomGameListing>> {
	const result = await getClassroomGameListingList(query, offset, institutionId, '', signal);
	return { itemList: result.classroomGameListingList, totalItemCount: result.totalItemCount };
}

function classroomGameListingState(listing: ClassroomGameListing): string {
	const now = Date.now();
	if (!listing.publishedAt || new Date(listing.publishedAt).getTime() > now) {
		return 'unpublished';
	}
	if (new Date(listing.endAt).getTime() < now) {
		return 'expired';
	}
	if (new Date(listing.startAt).getTime() > now) {
		return 'scheduled';
	}
	return 'active';
}

export function InstitutionListPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const selectedInstitutionId = searchParams.get('selectedId') ?? '';
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [offset, setOffset] = useState(0);
	const [reloadKey, setReloadKey] = useState(0);
	const [isCreateOpen, setCreateOpen] = useState(false);
	const [result, setResult] = useState<InstitutionListResponse>();
	const [error, setError] = useState<string>();
	const [isLoading, setLoading] = useState(true);
	const [selectedInstitution, setSelectedInstitution] = useState<Institution>();
	const [selectedInstitutionError, setSelectedInstitutionError] = useState<string>();
	const [isSelectedInstitutionLoading, setSelectedInstitutionLoading] = useState(false);

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(undefined);
		setResult(undefined);
		getInstitutionList(search, offset, statusFilter, controller.signal)
			.then((institutionListResult) => {
				setResult(institutionListResult);
				if (institutionListResult.institutionList.length > 0) {
					setSearchParams((current) => {
						if (current.has('selectedId')) {
							return current;
						}
						const next = new URLSearchParams(current);
						next.set('selectedId', institutionListResult.institutionList[0].id);
						if (!next.has('tab')) {
							next.set('tab', 'overview');
						}
						return next;
					}, { replace: true });
				}
			})
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Institutions could not be loaded.');
			})
			.finally(() => setLoading(false));

		return () => controller.abort();
	}, [offset, reloadKey, search, setSearchParams, statusFilter]);

	useEffect(() => {
		if (!selectedInstitutionId) {
			setSelectedInstitution(undefined);
			setSelectedInstitutionError(undefined);
			setSelectedInstitutionLoading(false);
			return;
		}

		const controller = new AbortController();
		setSelectedInstitution(undefined);
		setSelectedInstitutionError(undefined);
		setSelectedInstitutionLoading(true);
		getInstitution(selectedInstitutionId, controller.signal)
			.then(setSelectedInstitution)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setSelectedInstitutionError(requestError instanceof Error ? requestError.message : 'Institution details could not be loaded.');
			})
			.finally(() => {
				if (!controller.signal.aborted) {
					setSelectedInstitutionLoading(false);
				}
			});

		return () => controller.abort();
	}, [reloadKey, selectedInstitutionId]);

	const totalItemCount = result?.totalItemCount ?? 0;
	const firstItem = totalItemCount === 0 ? 0 : offset + 1;
	const lastItem = Math.min(offset + pageSize, totalItemCount);

	function clearSelectedInstitution(): void {
		setSearchParams((current) => {
			if (!current.has('selectedId')) {
				return current;
			}
			const next = new URLSearchParams(current);
			next.delete('selectedId');
			return next;
		});
	}

	function selectInstitution(institutionId: string): void {
		setSearchParams((current) => {
			const next = new URLSearchParams(current);
			next.set('selectedId', institutionId);
			if (!next.has('tab')) {
				next.set('tab', 'overview');
			}
			return next;
		});
	}

	return (
		<section className="page-content" aria-labelledby="page-title">
			<div className="page-heading">
				<div>
					<p className="eyebrow">Education</p>
					<h1 id="page-title">Institutions</h1>
					<p className="page-description">Review institution records and their portal status.</p>
				</div>
				<div className="institution-heading-actions">
					<Button className="refresh-button" onClick={() => setCreateOpen(!isCreateOpen)} size="sm" type="button" variant={isCreateOpen ? 'outline' : 'default'}>
						{isCreateOpen ? <X size={15}/> : <Plus size={15}/>} {isCreateOpen ? 'Cancel' : 'Add institution'}
					</Button>
					<Button className="refresh-button" onClick={() => setReloadKey(reloadKey + 1)} size="sm" type="button" variant="outline">
						<RefreshCw size={15}/> Refresh
					</Button>
				</div>
			</div>
			{isCreateOpen && (
				<InstitutionForm
					onCancel={() => setCreateOpen(false)}
					onSubmit={async (input) => {
						const institution = await createInstitution(input);
						setCreateOpen(false);
						setStatusFilter('');
						setSearch(institution.name);
						setOffset(0);
						setReloadKey(reloadKey + 1);
						setSearchParams((current) => {
							const next = new URLSearchParams(current);
							next.set('selectedId', institution.id);
							next.set('tab', 'overview');
							return next;
						});
					}}
					submitLabel="Create institution"
				/>
			)}
			<div className="table-toolbar">
				<label className="search-field">
					<Search aria-hidden="true" size={17}/>
					<input aria-label="Search institutions" onChange={(event) => {
						clearSelectedInstitution();
						setSearch(event.target.value);
						setOffset(0);
					}} placeholder="Search institutions" value={search}/>
				</label>
				<label className="status-filter">
					<span>Status</span>
					<select aria-label="Filter by status" onChange={(event) => {
						clearSelectedInstitution();
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
				<div className="institution-table-header">
					<span>Institution</span><span>Slug</span><span>Status</span><span/>
				</div>
				{error && (
					<div className="inline-error" role="alert">
						<AlertCircle size={17}/><span>{error}</span>
						<Button onClick={() => setReloadKey(reloadKey + 1)} size="sm" variant="outline">Try again</Button>
					</div>
				)}
				{isLoading && <div aria-label="Loading institutions" className="table-loading"><span/><span/><span/><span/></div>}
				{!isLoading && !error && result?.institutionList.length === 0 && (
					<div className="empty-state">
						<div className="empty-mark"><Building2 size={20}/></div>
						<strong>No institutions found</strong>
						<p>Try a different search or status filter.</p>
					</div>
				)}
				{!isLoading && !error && result && result.institutionList.length > 0 && (
					<div className="institution-rows">
						{result.institutionList.map((institution) => <InstitutionRow
							institution={institution}
							isSelected={selectedInstitutionId === institution.id}
							key={institution.id}
							onSelect={() => selectInstitution(institution.id)}
						/>)}
					</div>
				)}
			</div>
			<div className="table-pagination">
				<span>{totalItemCount === 0 ? 'No institutions' : `Showing ${firstItem}–${lastItem} of ${totalItemCount}`}</span>
				<div>
					<Button aria-label="Previous page" disabled={offset === 0 || isLoading} onClick={() => {
						clearSelectedInstitution();
						setOffset(Math.max(0, offset - pageSize));
					}} size="icon" variant="outline"><ChevronLeft size={16}/></Button>
					<Button aria-label="Next page" disabled={offset + pageSize >= totalItemCount || isLoading} onClick={() => {
						clearSelectedInstitution();
						setOffset(offset + pageSize);
					}} size="icon" variant="outline"><ChevronRight size={16}/></Button>
				</div>
			</div>
			{selectedInstitutionId && <section aria-label="Selected institution" className="institution-selected-detail">
				{isSelectedInstitutionLoading && <div className="detail-loading">Loading institution details...</div>}
				{selectedInstitutionError && <div className="detail-error" role="alert"><AlertCircle size={18}/>{selectedInstitutionError}</div>}
				{selectedInstitution && <InstitutionDetails
					institution={selectedInstitution}
					key={selectedInstitution.id}
					onInstitutionUpdate={(updatedInstitution) => {
						setSelectedInstitution(updatedInstitution);
						setResult((current) => current ? {
							...current,
							institutionList: current.institutionList.map((item) => item.id === updatedInstitution.id ? updatedInstitution : item),
						} : current);
					}}
					embedded
				/>}
			</section>}
		</section>
	);
}

function InstitutionRow({
	institution,
	isSelected,
	onSelect,
}: {
	institution: Institution;
	isSelected: boolean;
	onSelect: () => void;
}) {
	return (
		<div className={`institution-row institution-master-row${isSelected ? ' is-selected' : ''}`}>
			<div className="institution-name-cell">
				<div className="institution-row-mark"><Building2 size={17}/></div>
				<div><button aria-pressed={isSelected} className="institution-select-button" onClick={onSelect} type="button">{institution.name}</button><span>{institution.websiteUrl ?? institution.summary ?? 'Institution record'}</span></div>
			</div>
			<span className="institution-slug">{institution.slug}</span>
			<span className={`status-badge status-${institution.status}`}>{institution.status}</span>
			<Link aria-label={`Open ${institution.name}`} className="row-open" to={`/institutions/${institution.id}`}><ExternalLink size={15}/></Link>
		</div>
	);
}

export function InstitutionDetailPage() {
	const { id = '' } = useParams();
	const [searchParams] = useSearchParams();
	const [institution, setInstitution] = useState<Institution>();
	const [error, setError] = useState<string>();

	useEffect(() => {
		const controller = new AbortController();
		getInstitution(id, controller.signal)
			.then(setInstitution)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Institution details could not be loaded.');
			});

		return () => controller.abort();
	}, [id]);

	return (
		<section className="page-content" aria-labelledby="page-title">
			<Link className="back-link" to={`/institutions?selectedId=${encodeURIComponent(id)}&tab=${encodeURIComponent(searchParams.get('tab') ?? 'overview')}`}><ArrowLeft size={15}/> Institutions</Link>
			{error && <div className="detail-error" role="alert"><AlertCircle size={18}/>{error}</div>}
			{!error && !institution && <div className="detail-loading">Loading institution...</div>}
			{institution && <InstitutionDetails institution={institution} onInstitutionUpdate={setInstitution}/>}
		</section>
	);
}

function InstitutionDetails({
	institution,
	onInstitutionUpdate,
	embedded = false,
}: {
	institution: Institution;
	onInstitutionUpdate: (institution: Institution) => void;
	embedded?: boolean;
}) {
	const [searchParams, setSearchParams] = useSearchParams();
	const activeTab = institutionTabFrom(searchParams.get('tab'));
	const [isEditing, setEditing] = useState(false);
	const [statusError, setStatusError] = useState<string>();
	const [isUpdatingStatus, setUpdatingStatus] = useState(false);

	function selectTab(tab: InstitutionTab): void {
		setSearchParams((current) => {
			const next = new URLSearchParams(current);
			next.set('tab', tab);
			return next;
		});
	}

	function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentTab: InstitutionTab): void {
		const currentIndex = institutionTabList.findIndex((tab) => tab.id === currentTab);
		let nextIndex: number;
		if (event.key === 'ArrowRight') {
			nextIndex = (currentIndex + 1) % institutionTabList.length;
		} else if (event.key === 'ArrowLeft') {
			nextIndex = (currentIndex - 1 + institutionTabList.length) % institutionTabList.length;
		} else if (event.key === 'Home') {
			nextIndex = 0;
		} else if (event.key === 'End') {
			nextIndex = institutionTabList.length - 1;
		} else {
			return;
		}

		event.preventDefault();
		const nextTab = institutionTabList[nextIndex];
		selectTab(nextTab.id);
		document.getElementById(`institution-tab-${nextTab.id}`)?.focus();
	}

	async function updateStatus(status: Institution['status']): Promise<void> {
		setUpdatingStatus(true);
		setStatusError(undefined);
		try {
			onInstitutionUpdate(await updateInstitution(institution.id, { status }));
		} catch (requestError) {
			setStatusError(requestError instanceof Error ? requestError.message : 'Institution status could not be updated.');
		} finally {
			setUpdatingStatus(false);
		}
	}

	return (
		<>
			<div className={`detail-heading institution-detail-heading${embedded ? ' is-embedded' : ''}`}>
				<div className="detail-mark"><Building2 size={22}/></div>
				<div>
					<p className="eyebrow">{embedded ? 'Selected institution' : 'Education / Institutions'}</p>
					{embedded ? <h2 id={`institution-detail-heading-${institution.id}`}>{institution.name}</h2> : <h1 id="page-title">{institution.name}</h1>}
					<p className="page-description">{institution.slug}</p>
				</div>
				<div className="institution-detail-actions">
					<span className={`status-badge status-${institution.status}`}>{institution.status}</span>
					{!isEditing && (
						<>
							<Button className="refresh-button" onClick={() => setEditing(true)} size="sm" type="button" variant="outline"><Pencil size={14}/> Edit</Button>
							<Button className="refresh-button" disabled={isUpdatingStatus} onClick={() => updateStatus(institution.status === 'active' ? 'inactive' : 'active')} size="sm" type="button" variant="outline"><Power size={14}/>{institution.status === 'active' ? 'Deactivate' : 'Activate'}</Button>
						</>
					)}
				</div>
			</div>
			{statusError && <div className="detail-error" role="alert"><AlertCircle size={17}/>{statusError}</div>}
			{isEditing && (
				<InstitutionForm
					institution={institution}
					onCancel={() => setEditing(false)}
					onSubmit={async (input) => {
						onInstitutionUpdate(await updateInstitution(institution.id, input));
						setEditing(false);
					}}
					submitLabel="Save changes"
				/>
			)}
			<div aria-label={`${institution.name} sections`} className="institution-detail-tabs" role="tablist">
				{institutionTabList.map(({ id, label }) => <button
					aria-controls="institution-detail-tabpanel"
					aria-selected={activeTab === id}
					id={`institution-tab-${id}`}
					key={id}
					onClick={() => selectTab(id)}
					onKeyDown={(event) => handleTabKeyDown(event, id)}
					role="tab"
					tabIndex={activeTab === id ? 0 : -1}
					type="button"
				>{label}</button>)}
			</div>
			<div aria-labelledby={`institution-tab-${activeTab}`} className="institution-detail-tabpanel" id="institution-detail-tabpanel" role="tabpanel" tabIndex={0}>
				{activeTab === 'overview' && <div className="institution-profile-panel">
					<h2>Institution profile</h2>
					<dl className="detail-grid">
						<div><dt>Portal status</dt><dd>{institution.status}</dd></div>
						<div><dt>Slug</dt><dd>{institution.slug}</dd></div>
						<div><dt>Website</dt><dd>{institution.websiteUrl ? <a href={institution.websiteUrl} rel="noreferrer" target="_blank">{institution.websiteUrl}<ExternalLink size={13}/></a> : 'Not provided'}</dd></div>
						<div><dt>Summary</dt><dd>{institution.summary || 'No summary provided.'}</dd></div>
						<div><dt>Description</dt><dd>{institution.description || 'No description provided.'}</dd></div>
					</dl>
				</div>}
				{activeTab === 'classrooms' && <InstitutionRelatedList<Classroom>
					emptyDescription="This institution has no classrooms matching the current filters."
					emptyIcon={<GraduationCap size={20}/>}
					emptyTitle="No classrooms found"
					getItemId={(classroom) => classroom.id}
					headerList={['Classroom', 'Course type', 'Status', '']}
					headerClassName="classroom-table-header"
					institutionId={institution.id}
					institutionName={institution.name}
					loadPage={loadInstitutionClassrooms}
					manageHref={`/classrooms?institutionId=${encodeURIComponent(institution.id)}`}
					searchLabel="Search classrooms"
					searchPlaceholder="Search classrooms"
					statusOptions={educationStatusOptions}
					title="Classrooms"
					renderItem={(classroom) => <div className="institution-row classroom-row">
						<div className="institution-name-cell"><div className="institution-row-mark"><GraduationCap size={17}/></div><div><Link to={`/classrooms/${classroom.id}`}>{classroom.name}</Link><span>{classroom.code} · {classroom.language}</span></div></div>
						<span className="institution-slug">{classroom.courseType === 'game-based' ? 'Game-based' : 'Standard'}</span>
						<span className={`status-badge status-${classroom.status}`}>{classroom.status}</span>
						<Link aria-label={`Open ${classroom.name}`} className="row-open" to={`/classrooms/${classroom.id}`}><ExternalLink size={15}/></Link>
					</div>}
				/>}
				{activeTab === 'courses' && <InstitutionRelatedList<Course>
					emptyDescription="This institution has no courses matching the current filters."
					emptyIcon={<BookOpen size={20}/>}
					emptyTitle="No courses found"
					getItemId={(course) => course.id}
					headerList={['Course', 'Code', 'Status', '']}
					headerClassName="classroom-table-header"
					institutionId={institution.id}
					institutionName={institution.name}
					loadPage={loadInstitutionCourses}
					manageHref={`/courses?institutionId=${encodeURIComponent(institution.id)}`}
					searchLabel="Search courses"
					searchPlaceholder="Search courses"
					statusOptions={educationStatusOptions}
					title="Courses"
					renderItem={(course) => <div className="institution-row classroom-row">
						<div className="institution-name-cell"><div className="institution-row-mark"><BookOpen size={17}/></div><div><Link to={`/courses/${course.id}`}>{course.name}</Link><span>{course.slug}</span></div></div>
						<span className="institution-slug">{course.code}</span>
						<span className={`status-badge status-${course.status}`}>{course.status}</span>
						<Link aria-label={`Open ${course.name}`} className="row-open" to={`/courses/${course.id}`}><ExternalLink size={15}/></Link>
					</div>}
				/>}
				{activeTab === 'instructors' && <InstitutionRelatedList<InstructorListItem>
					emptyDescription="This institution has no instructors matching the current search."
					emptyIcon={<Users size={20}/>}
					emptyTitle="No instructors found"
					getItemId={(instructor) => instructor.id}
					headerList={['Instructor', 'Slug', 'Account', '']}
					headerClassName="classroom-table-header instructor-table-header"
					institutionId={institution.id}
					institutionName={institution.name}
					loadPage={loadInstitutionInstructors}
					manageHref={`/instructors?institutionId=${encodeURIComponent(institution.id)}`}
					searchLabel="Search instructors"
					searchPlaceholder="Search instructors"
					title="Instructors"
					renderItem={(instructor) => <div className="institution-row classroom-row instructor-row">
						<div className="institution-name-cell"><div className="institution-row-mark"><Users size={17}/></div><div><Link to={`/instructors/${instructor.id}`}>{instructor.name}</Link><span>{instructor.slug}</span></div></div>
						<span className="institution-slug">{instructor.slug}</span>
						<span aria-label={instructor.hasAccount ? 'Portal account linked' : 'No portal account'} className={`instructor-account-status ${instructor.hasAccount ? 'is-linked' : ''}`}>
							{instructor.hasAccount ? <Check aria-hidden="true" size={13}/> : <Mail aria-hidden="true" size={13}/>}{instructor.hasAccount ? 'Linked' : 'No account'}
						</span>
						<Link aria-label={`Open ${instructor.name}`} className="row-open" to={`/instructors/${instructor.id}`}><ExternalLink size={15}/></Link>
					</div>}
				/>}
				{activeTab === 'classroom-games' && <InstitutionRelatedList<ClassroomGameListing>
					emptyDescription="This institution has no classroom game listings matching the current search."
					emptyIcon={<Gamepad2 size={20}/>}
					emptyTitle="No classroom games found"
					getItemId={(listing) => listing.id}
					headerList={['Game', 'Classroom', 'Access terms', 'Status', '']}
					headerClassName="classroom-game-listing-table-header"
					institutionId={institution.id}
					institutionName={institution.name}
					loadPage={loadInstitutionClassroomGames}
					manageHref={`/classroom-game-listings?institutionId=${encodeURIComponent(institution.id)}`}
					searchLabel="Search classroom games"
					searchPlaceholder="Search games or classrooms"
					title="Classroom games"
					renderItem={(listing) => <div className="institution-row classroom-row classroom-game-listing-row">
						<div className="institution-name-cell"><div className="institution-row-mark"><Gamepad2 size={17}/></div><div><Link to={`/classroom-game-listings/${listing.id}`}>{listing.gameTitle}</Link><span>{listing.publisher.name} · Version {listing.publisherVersion} · {listing.language}</span></div></div>
						<Link className="listing-classroom" to={`/classrooms/${listing.classroomId}`}>{listing.classroomName}</Link>
						<span className="institution-related-listing-terms">{listing.designatedPayor === 'institution' ? 'Institution pays' : 'Student pays'}<small>{listing.licenseDurationDays} days</small></span>
						<span className={`listing-state state-${classroomGameListingState(listing)}`}>{classroomGameListingState(listing)}</span>
						<Link aria-label={`Open ${listing.gameTitle} listing`} className="row-open" to={`/classroom-game-listings/${listing.id}`}><ExternalLink size={15}/></Link>
					</div>}
				/>}
			</div>
		</>
	);
}

function InstitutionRelatedList<TItem>({
	emptyDescription,
	emptyIcon,
	emptyTitle,
	getItemId,
	headerList,
	headerClassName,
	institutionId,
	institutionName,
	loadPage,
	manageHref,
	searchLabel,
	searchPlaceholder,
	statusOptions,
	title,
	renderItem,
}: {
	emptyDescription: string;
	emptyIcon: ReactNode;
	emptyTitle: string;
	getItemId: (item: TItem) => string;
	headerList: string[];
	headerClassName: string;
	institutionId: string;
	institutionName: string;
	loadPage: InstitutionRelatedPageLoader<TItem>;
	manageHref: string;
	searchLabel: string;
	searchPlaceholder: string;
	statusOptions?: { label: string; value: string }[];
	title: string;
	renderItem: (item: TItem) => ReactNode;
}) {
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [offset, setOffset] = useState(0);
	const [reloadKey, setReloadKey] = useState(0);
	const [result, setResult] = useState<InstitutionRelatedPage<TItem>>();
	const [error, setError] = useState<string>();
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(undefined);
		setResult(undefined);
		loadPage(institutionId, search, offset, statusFilter, controller.signal)
			.then(setResult)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : `${title} could not be loaded.`);
			})
			.finally(() => {
				if (!controller.signal.aborted) {
					setLoading(false);
				}
			});

		return () => controller.abort();
	}, [institutionId, loadPage, offset, reloadKey, search, statusFilter, title]);

	const totalItemCount = result?.totalItemCount ?? 0;
	const firstItem = totalItemCount === 0 ? 0 : offset + 1;
	const lastItem = Math.min(offset + pageSize, totalItemCount);

	return (
		<section aria-labelledby={`institution-related-${title.replaceAll(' ', '-')}`} className="institution-related-panel">
			<div className="institution-related-heading">
				<div><h3 id={`institution-related-${title.replaceAll(' ', '-')}`}>{title}</h3><p>Records for {institutionName}</p></div>
				<div className="institution-related-actions">
					<Link className="related-section-link" to={manageHref}><ExternalLink size={14}/> Open full list</Link>
					<Button aria-label={`Refresh ${title.toLowerCase()}`} disabled={isLoading} onClick={() => setReloadKey((current) => current + 1)} size="icon" variant="outline"><RefreshCw size={15}/></Button>
				</div>
			</div>
			<div className="table-toolbar">
				<label className="search-field">
					<Search aria-hidden="true" size={17}/>
					<input aria-label={searchLabel} onChange={(event) => {
						setSearch(event.target.value);
						setOffset(0);
					}} placeholder={searchPlaceholder} value={search}/>
				</label>
				{statusOptions && <label className="status-filter">
					<span>Status</span>
					<select aria-label={`Filter ${title.toLowerCase()} by status`} onChange={(event) => {
						setStatusFilter(event.target.value);
						setOffset(0);
					}} value={statusFilter}>
						<option value="">All statuses</option>
						{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
					</select>
				</label>}
			</div>
			<div className="table-frame">
				<div className={`institution-table-header ${headerClassName}`}>{headerList.map((header, index) => <span key={`${header}-${index}`}>{header}</span>)}</div>
				{error && <div className="inline-error" role="alert"><AlertCircle size={17}/><span>{error}</span><Button onClick={() => setReloadKey((current) => current + 1)} size="sm" variant="outline">Try again</Button></div>}
				{isLoading && <div aria-label={`Loading ${title.toLowerCase()}`} className="table-loading"><span/><span/><span/><span/></div>}
				{!isLoading && !error && result?.itemList.length === 0 && <div className="empty-state"><div className="empty-mark">{emptyIcon}</div><strong>{emptyTitle}</strong><p>{emptyDescription}</p></div>}
				{!isLoading && !error && result && result.itemList.length > 0 && <div className="institution-rows">{result.itemList.map((item) => <InstitutionRelatedItem key={getItemId(item)}>{renderItem(item)}</InstitutionRelatedItem>)}</div>}
			</div>
			<div className="table-pagination">
				<span>{totalItemCount === 0 ? `No ${title.toLowerCase()}` : `Showing ${firstItem}–${lastItem} of ${totalItemCount}`}</span>
				<div>
					<Button aria-label={`Previous ${title.toLowerCase()} page`} disabled={offset === 0 || isLoading} onClick={() => setOffset(Math.max(0, offset - pageSize))} size="icon" variant="outline"><ChevronLeft size={16}/></Button>
					<Button aria-label={`Next ${title.toLowerCase()} page`} disabled={offset + pageSize >= totalItemCount || isLoading} onClick={() => setOffset(offset + pageSize)} size="icon" variant="outline"><ChevronRight size={16}/></Button>
				</div>
			</div>
		</section>
	);
}

function InstitutionRelatedItem({ children }: { children: ReactNode }) {
	return <>{children}</>;
}

function InstitutionForm({
	institution,
	onCancel,
	onSubmit,
	submitLabel,
}: {
	institution?: Institution;
	onCancel: () => void;
	onSubmit: (input: CreateInstitutionInput) => Promise<void>;
	submitLabel: string;
}) {
	const [name, setName] = useState(institution?.name ?? '');
	const [slug, setSlug] = useState(institution?.slug ?? '');
	const [slugEdited, setSlugEdited] = useState(Boolean(institution));
	const [summary, setSummary] = useState(institution?.summary ?? '');
	const [description, setDescription] = useState(institution?.description ?? '');
	const [websiteUrl, setWebsiteUrl] = useState(institution?.websiteUrl ?? '');
	const [error, setError] = useState<string>();
	const [isSaving, setSaving] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
		event.preventDefault();
		setError(undefined);
		setSaving(true);
		try {
			await onSubmit({
				description: description.trim() || undefined,
				name: name.trim(),
				slug: slug.trim(),
				summary: summary.trim() || undefined,
				websiteUrl: websiteUrl.trim() || undefined,
			});
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : 'Institution could not be saved.');
		} finally {
			setSaving(false);
		}
	}

	return (
		<form className="institution-form" onSubmit={handleSubmit}>
			<div className="institution-form-fields">
				<label>Name<input autoComplete="organization" maxLength={160} onChange={(event) => {
					const value = event.target.value;
					setName(value);
					if (!slugEdited) {
						setSlug(value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
					}
				}} required value={name}/></label>
				<label>Slug<input aria-label="Institution slug" maxLength={160} onChange={(event) => {
					setSlugEdited(true);
					setSlug(event.target.value.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, ''));
				}} pattern="[a-z0-9]+(-[a-z0-9]+)*" required value={slug}/></label>
				<label>Website<input autoComplete="url" onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://example.edu" type="url" value={websiteUrl}/></label>
				<label>Summary<input maxLength={500} onChange={(event) => setSummary(event.target.value)} value={summary}/></label>
				<label className="institution-form-description">Description<textarea maxLength={10000} onChange={(event) => setDescription(event.target.value)} rows={3} value={description}/></label>
			</div>
			{error && <div className="institution-form-error" role="alert"><AlertCircle size={16}/>{error}</div>}
			<div className="institution-form-actions">
				<Button disabled={isSaving} onClick={onCancel} size="sm" type="button" variant="outline"><X size={14}/> Cancel</Button>
				<Button disabled={isSaving} size="sm" type="submit"><Check size={14}/>{isSaving ? 'Saving...' : submitLabel}</Button>
			</div>
		</form>
	);
}