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
	useEffect,
	useState
} from 'react';
import { Link, useParams } from 'react-router-dom';

import {
	createInstitution,
	type CreateInstitutionInput,
	getInstitution,
	getInstitutionList,
	type Institution,
	type InstitutionListResponse,
	updateInstitution,
} from '../../lib/admin-api';

const pageSize = 10;

export function InstitutionListPage() {
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [offset, setOffset] = useState(0);
	const [reloadKey, setReloadKey] = useState(0);
	const [isCreateOpen, setCreateOpen] = useState(false);
	const [result, setResult] = useState<InstitutionListResponse>();
	const [error, setError] = useState<string>();
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(undefined);
		getInstitutionList(search, offset, statusFilter, controller.signal)
			.then(setResult)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Institutions could not be loaded.');
			})
			.finally(() => setLoading(false));

		return () => controller.abort();
	}, [offset, reloadKey, search, statusFilter]);

	const totalItemCount = result?.totalItemCount ?? 0;
	const firstItem = totalItemCount === 0 ? 0 : offset + 1;
	const lastItem = Math.min(offset + pageSize, totalItemCount);

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
					}}
					submitLabel="Create institution"
				/>
			)}
			<div className="table-toolbar">
				<label className="search-field">
					<Search aria-hidden="true" size={17}/>
					<input aria-label="Search institutions" onChange={(event) => {
						setSearch(event.target.value);
						setOffset(0);
					}} placeholder="Search institutions" value={search}/>
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
						{result.institutionList.map((institution) => <InstitutionRow institution={institution} key={institution.id}/>) }
					</div>
				)}
			</div>
			<div className="table-pagination">
				<span>{totalItemCount === 0 ? 'No institutions' : `Showing ${firstItem}–${lastItem} of ${totalItemCount}`}</span>
				<div>
					<Button aria-label="Previous page" disabled={offset === 0 || isLoading} onClick={() => setOffset(Math.max(0, offset - pageSize))} size="icon" variant="outline"><ChevronLeft size={16}/></Button>
					<Button aria-label="Next page" disabled={offset + pageSize >= totalItemCount || isLoading} onClick={() => setOffset(offset + pageSize)} size="icon" variant="outline"><ChevronRight size={16}/></Button>
				</div>
			</div>
		</section>
	);
}

function InstitutionRow({ institution }: { institution: Institution }) {
	return (
		<div className="institution-row">
			<div className="institution-name-cell">
				<div className="institution-row-mark"><Building2 size={17}/></div>
				<div><Link to={`/institutions/${institution.id}`}>{institution.name}</Link><span>{institution.websiteUrl ?? institution.summary ?? 'Institution record'}</span></div>
			</div>
			<span className="institution-slug">{institution.slug}</span>
			<span className={`status-badge status-${institution.status}`}>{institution.status}</span>
			<Link aria-label={`Open ${institution.name}`} className="row-open" to={`/institutions/${institution.id}`}><ExternalLink size={15}/></Link>
		</div>
	);
}

export function InstitutionDetailPage() {
	const { id = '' } = useParams();
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
			<Link className="back-link" to="/institutions"><ArrowLeft size={15}/> Institutions</Link>
			{error && <div className="detail-error" role="alert"><AlertCircle size={18}/>{error}</div>}
			{!error && !institution && <div className="detail-loading">Loading institution...</div>}
			{institution && <InstitutionDetails institution={institution} onInstitutionUpdate={setInstitution}/>}
		</section>
	);
}

function InstitutionDetails({
	institution,
	onInstitutionUpdate,
}: {
	institution: Institution;
	onInstitutionUpdate: (institution: Institution) => void;
}) {
	const [isEditing, setEditing] = useState(false);
	const [statusError, setStatusError] = useState<string>();
	const [isUpdatingStatus, setUpdatingStatus] = useState(false);

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
			<div className="detail-heading">
				<div className="detail-mark"><Building2 size={22}/></div>
				<div>
					<p className="eyebrow">Education / Institutions</p>
					<h1 id="page-title">{institution.name}</h1>
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
			<div className="detail-section">
				<h2>Institution profile</h2>
				<dl className="detail-grid">
					<div><dt>Portal status</dt><dd>{institution.status}</dd></div>
					<div><dt>Slug</dt><dd>{institution.slug}</dd></div>
					<div><dt>Website</dt><dd>{institution.websiteUrl ? <a href={institution.websiteUrl} rel="noreferrer" target="_blank">{institution.websiteUrl}<ExternalLink size={13}/></a> : 'Not provided'}</dd></div>
					<div><dt>Summary</dt><dd>{institution.summary || 'No summary provided.'}</dd></div>
					<div><dt>Description</dt><dd>{institution.description || 'No description provided.'}</dd></div>
				</dl>
			</div>
			<div className="detail-section">
				<h2>Learning spaces</h2>
				<p>Browse the classrooms, courses, and game assignments associated with this institution.</p>
				<div className="learning-space-links">
					<Link className="related-section-link" to={`/classrooms?institutionId=${encodeURIComponent(institution.id)}`}><GraduationCap size={16}/> View classrooms</Link>
					<Link className="related-section-link" to={`/courses?institutionId=${encodeURIComponent(institution.id)}`}><BookOpen size={16}/> View courses</Link>
					<Link className="related-section-link" to={`/instructors?institutionId=${encodeURIComponent(institution.id)}`}><Users size={16}/> View instructors</Link>
					<Link className="related-section-link" to={`/classroom-games?institutionId=${encodeURIComponent(institution.id)}`}><Gamepad2 size={16}/> View classroom games</Link>
				</div>
			</div>
		</>
	);
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