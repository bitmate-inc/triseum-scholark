import { Button } from '@repo/ui/button';
import {
	AlertCircle,
	ArrowLeft,
	Building2,
	Check,
	ChevronLeft,
	ChevronRight,
	ExternalLink,
	Gamepad2,
	Pencil,
	Plus,
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
	useParams
} from 'react-router-dom';

import {
	createPublisher,
	type CreatePublisherInput,
	getPublisher,
	getPublisherList,
	type Publisher,
	type PublisherListResponse,
	type PublisherProfile,
	updatePublisher,
} from '../../lib/admin-api';

const pageSize = 10;
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

function publicationLabel(publishedAt?: string): string {
	if (!publishedAt) {
		return 'Unpublished';
	}
	const publicationDate = new Date(publishedAt);
	return publicationDate.getTime() > Date.now() ? `Scheduled ${dateFormat.format(publicationDate)}` : `Published ${dateFormat.format(publicationDate)}`;
}

function publicationState(publishedAt?: string): string {
	if (!publishedAt) {
		return 'unpublished';
	}
	return new Date(publishedAt).getTime() > Date.now() ? 'scheduled' : 'published';
}

export function PublisherListPage() {
	const navigate = useNavigate();
	const [search, setSearch] = useState('');
	const [offset, setOffset] = useState(0);
	const [reloadKey, setReloadKey] = useState(0);
	const [isCreateOpen, setCreateOpen] = useState(false);
	const [result, setResult] = useState<PublisherListResponse>();
	const [error, setError] = useState<string>();
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(undefined);
		getPublisherList(search, offset, controller.signal)
			.then(setResult)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Publishers could not be loaded.');
			})
			.finally(() => setLoading(false));

		return () => controller.abort();
	}, [offset, reloadKey, search]);

	const totalItemCount = result?.totalItemCount ?? 0;
	const firstItem = totalItemCount === 0 ? 0 : offset + 1;
	const lastItem = Math.min(offset + pageSize, totalItemCount);

	return (
		<section className="page-content" aria-labelledby="page-title">
			<div className="page-heading">
				<div>
					<p className="eyebrow">Catalog</p>
					<h1 id="page-title">Publishers</h1>
					<p className="page-description">Review publisher records and their game catalogs.</p>
				</div>
				<div className="institution-heading-actions">
					<Button className="refresh-button" onClick={() => setCreateOpen(!isCreateOpen)} size="sm" type="button" variant={isCreateOpen ? 'outline' : 'default'}>
						{isCreateOpen ? <X size={15}/> : <Plus size={15}/>} {isCreateOpen ? 'Cancel' : 'Add publisher'}
					</Button>
					<Button className="refresh-button" onClick={() => setReloadKey(reloadKey + 1)} size="sm" type="button" variant="outline">
						<RefreshCw size={15}/> Refresh
					</Button>
				</div>
			</div>
			{isCreateOpen && (
				<PublisherForm
					onCancel={() => setCreateOpen(false)}
					onSubmit={async (input) => {
						const publisher = await createPublisher(input);
						setCreateOpen(false);
						navigate(`/publishers/${publisher.id}`);
					}}
					submitLabel="Create publisher"
				/>
			)}
			<div className="table-toolbar">
				<label className="search-field">
					<Search aria-hidden="true" size={17}/>
					<input aria-label="Search publishers" onChange={(event) => {
						setSearch(event.target.value);
						setOffset(0);
					}} placeholder="Search publishers" value={search}/>
				</label>
			</div>
			<div className="table-frame">
				<div className="institution-table-header">
					<span>Publisher</span><span>Slug</span><span>Website</span><span/>
				</div>
				{error && <div className="inline-error" role="alert"><AlertCircle size={17}/><span>{error}</span><Button onClick={() => setReloadKey(reloadKey + 1)} size="sm" variant="outline">Try again</Button></div>}
				{isLoading && <div aria-label="Loading publishers" className="table-loading"><span/><span/><span/><span/></div>}
				{!isLoading && !error && result?.publisherList.length === 0 && <div className="empty-state"><div className="empty-mark"><Building2 size={20}/></div><strong>No publishers found</strong><p>Try a different search.</p></div>}
				{!isLoading && !error && result && result.publisherList.length > 0 && <div className="institution-rows">{result.publisherList.map((publisher) => <PublisherRow key={publisher.id} publisher={publisher}/>)}</div>}
			</div>
			<div className="table-pagination">
				<span>{totalItemCount === 0 ? 'No publishers' : `Showing ${firstItem}–${lastItem} of ${totalItemCount}`}</span>
				<div>
					<Button aria-label="Previous page" disabled={offset === 0 || isLoading} onClick={() => setOffset(Math.max(0, offset - pageSize))} size="icon" variant="outline"><ChevronLeft size={16}/></Button>
					<Button aria-label="Next page" disabled={offset + pageSize >= totalItemCount || isLoading} onClick={() => setOffset(offset + pageSize)} size="icon" variant="outline"><ChevronRight size={16}/></Button>
				</div>
			</div>
		</section>
	);
}

function PublisherRow({ publisher }: { publisher: Publisher }) {
	return (
		<div className="institution-row">
			<div className="institution-name-cell">
				<div className="institution-row-mark"><Building2 size={17}/></div>
				<div><Link to={`/publishers/${publisher.id}`}>{publisher.name}</Link><span>{publisher.websiteUrl ?? 'Publisher record'}</span></div>
			</div>
			<span className="institution-slug">{publisher.slug}</span>
			{publisher.websiteUrl ? <a className="publisher-website-link" href={publisher.websiteUrl} rel="noreferrer" target="_blank">Website <ExternalLink size={13}/></a> : <span className="publisher-website-empty">Not provided</span>}
			<Link aria-label={`Open ${publisher.name}`} className="row-open" to={`/publishers/${publisher.id}`}><ExternalLink size={15}/></Link>
		</div>
	);
}

export function PublisherDetailPage() {
	const { id = '' } = useParams();
	const [publisher, setPublisher] = useState<PublisherProfile>();
	const [error, setError] = useState<string>();

	useEffect(() => {
		const controller = new AbortController();
		setPublisher(undefined);
		setError(undefined);
		getPublisher(id, controller.signal)
			.then(setPublisher)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Publisher details could not be loaded.');
			});

		return () => controller.abort();
	}, [id]);

	return (
		<section className="page-content" aria-labelledby="page-title">
			<Link className="back-link" to="/publishers"><ArrowLeft size={15}/> Publishers</Link>
			{error && <div className="detail-error" role="alert"><AlertCircle size={18}/>{error}</div>}
			{!error && !publisher && <div className="detail-loading">Loading publisher...</div>}
			{publisher && <PublisherDetails publisher={publisher}/>}
		</section>
	);
}

function PublisherDetails({ publisher }: { publisher: PublisherProfile }) {
	const [currentPublisher, setCurrentPublisher] = useState(publisher);
	const [isEditing, setEditing] = useState(false);

	return (
		<>
			<div className="detail-heading">
				<div className="detail-mark"><Building2 size={22}/></div>
				<div>
					<p className="eyebrow">Catalog / Publishers</p>
					<h1 id="page-title">{currentPublisher.name}</h1>
					<p className="page-description">{currentPublisher.slug}</p>
				</div>
				{!isEditing && <Button className="refresh-button" onClick={() => setEditing(true)} size="sm" type="button" variant="outline"><Pencil size={14}/> Edit</Button>}
			</div>
			{isEditing && (
				<PublisherForm
					key={currentPublisher.id}
					onCancel={() => setEditing(false)}
					onSubmit={async (input) => {
						setCurrentPublisher(await updatePublisher(currentPublisher.id, input));
						setEditing(false);
					}}
					submitLabel="Save changes"
					publisher={currentPublisher}
				/>
			)}
			<div className="detail-section">
				<h2>Publisher profile</h2>
				<dl className="detail-grid">
					<div><dt>Name</dt><dd>{currentPublisher.name}</dd></div>
					<div><dt>Slug</dt><dd>{currentPublisher.slug}</dd></div>
					<div><dt>Website</dt><dd>{currentPublisher.websiteUrl ? <a href={currentPublisher.websiteUrl} rel="noreferrer" target="_blank">{currentPublisher.websiteUrl}<ExternalLink size={13}/></a> : 'Not provided'}</dd></div>
					<div><dt>Games</dt><dd>{currentPublisher.gameList.length}</dd></div>
				</dl>
			</div>
			<div className="detail-section">
				<h2><Gamepad2 size={15}/> Games <Link className="publisher-catalog-link" to={`/games?publisherId=${encodeURIComponent(currentPublisher.id)}`}>View catalog <ExternalLink size={13}/></Link></h2>
				{currentPublisher.gameList.length > 0 ? <ul className="related-record-list publisher-game-list">{currentPublisher.gameList.map((game) => <li className="publisher-game-item" key={game.id}>
					<div className="publisher-game-heading"><Link to={`/games/${game.id}`}>{game.title}</Link><span className={`publication-state state-${publicationState(game.publishedAt)}`}>{publicationLabel(game.publishedAt)}</span></div>
					<small>{game.slug}{game.summary ? ` · ${game.summary}` : ''}</small>
					{game.gameVersionList.length > 0 ? <ul className="publisher-version-list">{game.gameVersionList.map((version) => <li key={version.id}><span>Version {version.publisherVersion}</span><span className={`publication-state state-${publicationState(version.publishedAt)}`}>{publicationLabel(version.publishedAt)}</span></li>)}</ul> : <small>No versions.</small>}
				</li>)}</ul> : <p>No games in this publisher catalog.</p>}
			</div>
		</>
	);
}

function PublisherForm({
	onCancel,
	onSubmit,
	publisher,
	submitLabel,
}: {
	onCancel: () => void;
	onSubmit: (input: CreatePublisherInput) => Promise<void>;
	publisher?: PublisherProfile;
	submitLabel: string;
}) {
	const [name, setName] = useState(publisher?.name ?? '');
	const [slug, setSlug] = useState(publisher?.slug ?? '');
	const [slugEdited, setSlugEdited] = useState(Boolean(publisher));
	const [websiteUrl, setWebsiteUrl] = useState(publisher?.websiteUrl ?? '');
	const [error, setError] = useState<string>();
	const [isSaving, setSaving] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
		event.preventDefault();
		setError(undefined);
		setSaving(true);
		try {
			await onSubmit({ name: name.trim(), slug: slug.trim(), websiteUrl: websiteUrl.trim() });
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : 'Publisher could not be saved.');
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
				<label>Slug<input aria-label="Publisher slug" maxLength={160} onChange={(event) => {
					setSlugEdited(true);
					setSlug(event.target.value.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, ''));
				}} pattern="[a-z0-9]+(-[a-z0-9]+)*" required value={slug}/></label>
				<label>Website URL<input autoComplete="url" maxLength={2048} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://example.com" type="url" value={websiteUrl}/></label>
			</div>
			{error && <div className="institution-form-error" role="alert"><AlertCircle size={16}/>{error}</div>}
			<div className="institution-form-actions">
				<Button disabled={isSaving} onClick={onCancel} size="sm" type="button" variant="outline"><X size={14}/> Cancel</Button>
				<Button disabled={isSaving} size="sm" type="submit"><Check size={14}/>{isSaving ? 'Saving...' : submitLabel}</Button>
			</div>
		</form>
	);
}