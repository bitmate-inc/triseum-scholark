import { Button } from '@repo/ui/button';
import {
	AlertCircle,
	ArrowLeft,
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
	useRef,
	useState
} from 'react';
import {
	Link,
	useLocation,
	useNavigate,
	useParams,
	useSearchParams
} from 'react-router-dom';

import {
	type AdminGame,
	type AdminGameListResponse,
	type AdminGameProfile,
	createAdminGame,
	type CreateAdminGameInput,
	createAdminGameVersion,
	type CreateAdminGameVersionInput,
	createAdminPublicGameListing,
	type CreateAdminPublicGameListingInput,
	getAdminGame,
	getAdminGameList,
	getAllPublishers,
	getPublisher,
	type Publisher,
	updateAdminGame,
	updateAdminGameVersion,
	type UpdateAdminGameVersionInput,
	updateAdminPublicGameListing,
	type UpdateAdminPublicGameListingInput,
} from '../../lib/admin-api';

const pageSize = 10;
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
const dateTimeFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

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

function isPublished(publishedAt?: string): boolean {
	return Boolean(publishedAt && new Date(publishedAt).getTime() <= Date.now());
}

function formatPrice(price: { currency: string; minorUnitAmount: number }): string {
	return new Intl.NumberFormat(undefined, {
		currency: price.currency,
		style: 'currency',
	}).format(price.minorUnitAmount / 100);
}

function formatDateTime(value?: string): string {
	return value ? dateTimeFormat.format(new Date(value)) : 'No end date';
}

export function GameListPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const publisherId = searchParams.get('publisherId') ?? '';
	const [publisher, setPublisher] = useState<Publisher>();
	const [search, setSearch] = useState('');
	const [publication, setPublication] = useState('');
	const [offset, setOffset] = useState(0);
	const [reloadKey, setReloadKey] = useState(0);
	const [isCreateOpen, setCreateOpen] = useState(false);
	const [result, setResult] = useState<AdminGameListResponse>();
	const [error, setError] = useState<string>();
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		if (!publisherId) {
			setPublisher(undefined);
			return;
		}
		const controller = new AbortController();
		getPublisher(publisherId, controller.signal).then(setPublisher).catch(() => setPublisher(undefined));
		return () => controller.abort();
	}, [publisherId]);

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(undefined);
		getAdminGameList(search, offset, publication, publisherId, controller.signal)
			.then(setResult)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Games could not be loaded.');
			})
			.finally(() => setLoading(false));

		return () => controller.abort();
	}, [offset, publication, publisherId, reloadKey, search]);

	const totalItemCount = result?.totalItemCount ?? 0;
	const firstItem = totalItemCount === 0 ? 0 : offset + 1;
	const lastItem = Math.min(offset + pageSize, totalItemCount);

	return (
		<section className="page-content" aria-labelledby="page-title">
			<div className="page-heading">
				<div>
					<p className="eyebrow">Catalog</p>
					<h1 id="page-title">Games</h1>
					<p className="page-description">Review catalog records, publication states, versions, and listings.</p>
				</div>
				<div className="institution-heading-actions">
					<Button className="refresh-button" onClick={() => setCreateOpen(!isCreateOpen)} size="sm" type="button" variant={isCreateOpen ? 'outline' : 'default'}>
						{isCreateOpen ? <X size={15}/> : <Plus size={15}/>} {isCreateOpen ? 'Cancel' : 'Add game'}
					</Button>
					<Button className="refresh-button" onClick={() => setReloadKey(reloadKey + 1)} size="sm" type="button" variant="outline">
						<RefreshCw size={15}/> Refresh
					</Button>
				</div>
			</div>
			{isCreateOpen && (
				<GameForm
					initialPublisherId={publisherId || undefined}
					onCancel={() => setCreateOpen(false)}
					onSubmit={async (input) => {
						const game = await createAdminGame(input);
						setCreateOpen(false);
						navigate(`/games/${game.id}`);
					}}
					submitLabel="Create game"
				/>
			)}
			{publisherId && <p className="filter-context">Publisher: {publisher ? <Link to={`/publishers/${publisher.id}`}>{publisher.name}</Link> : 'filtered'} <button onClick={() => {
				setSearchParams((current) => {
					current.delete('publisherId');
					return current;
				});
				setOffset(0);
			}} type="button">Clear filter</button></p>}
			<div className="table-toolbar">
				<label className="search-field">
					<Search aria-hidden="true" size={17}/>
					<input aria-label="Search games" onChange={(event) => {
						setSearch(event.target.value);
						setOffset(0);
					}} placeholder="Search games or slugs" value={search}/>
				</label>
				<label className="status-filter"><span>Publication</span><select aria-label="Filter games by publication" onChange={(event) => {
					setPublication(event.target.value);
					setOffset(0);
				}} value={publication}>
					<option value="">All states</option>
					<option value="published">Published</option>
					<option value="scheduled">Scheduled</option>
					<option value="unpublished">Unpublished</option>
				</select></label>
			</div>
			<div className="table-frame">
				<div className="institution-table-header game-table-header"><span>Game</span><span>Publisher</span><span>Publication</span><span/></div>
				{error && <div className="inline-error" role="alert"><AlertCircle size={17}/><span>{error}</span><Button onClick={() => setReloadKey(reloadKey + 1)} size="sm" variant="outline">Try again</Button></div>}
				{isLoading && <div aria-label="Loading games" className="table-loading"><span/><span/><span/><span/></div>}
				{!isLoading && !error && result?.gameList.length === 0 && <div className="empty-state"><div className="empty-mark"><Gamepad2 size={20}/></div><strong>No games found</strong><p>Try a different search or publication filter.</p></div>}
				{!isLoading && !error && result && result.gameList.length > 0 && <div className="institution-rows">{result.gameList.map((game) => <GameRow game={game} key={game.id}/>)}</div>}
			</div>
			<div className="table-pagination">
				<span>{totalItemCount === 0 ? 'No games' : `Showing ${firstItem}–${lastItem} of ${totalItemCount}`}</span>
				<div>
					<Button aria-label="Previous page" disabled={offset === 0 || isLoading} onClick={() => setOffset(Math.max(0, offset - pageSize))} size="icon" variant="outline"><ChevronLeft size={16}/></Button>
					<Button aria-label="Next page" disabled={offset + pageSize >= totalItemCount || isLoading} onClick={() => setOffset(offset + pageSize)} size="icon" variant="outline"><ChevronRight size={16}/></Button>
				</div>
			</div>
		</section>
	);
}

function GameRow({ game }: { game: AdminGame }) {
	return (
		<div className="institution-row game-row">
			<div className="institution-name-cell">
				<div className="institution-row-mark"><Gamepad2 size={17}/></div>
				<div><Link to={`/games/${game.id}`}>{game.title}</Link><span>{game.slug}{game.featured ? ' · Featured' : ''}</span></div>
			</div>
			<Link className="game-publisher-link" to={`/publishers/${game.publisher.id}`}>{game.publisher.name}</Link>
			<span className={`publication-state state-${publicationState(game.publishedAt)}`}>{publicationLabel(game.publishedAt)}</span>
			<Link aria-label={`Open ${game.title}`} className="row-open" to={`/games/${game.id}`}><ExternalLink size={15}/></Link>
		</div>
	);
}

export function GameDetailPage() {
	const { id = '' } = useParams();
	const [game, setGame] = useState<AdminGameProfile>();
	const [error, setError] = useState<string>();

	useEffect(() => {
		const controller = new AbortController();
		setGame(undefined);
		setError(undefined);
		getAdminGame(id, controller.signal)
			.then(setGame)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Game details could not be loaded.');
			});

		return () => controller.abort();
	}, [id]);

	return (
		<section className="page-content" aria-labelledby="page-title">
			<Link className="back-link" to="/games"><ArrowLeft size={15}/> Games</Link>
			{error && <div className="detail-error" role="alert"><AlertCircle size={18}/>{error}</div>}
			{!error && !game && <div className="detail-loading">Loading game...</div>}
			{game && <GameDetails game={game}/>}
		</section>
	);
}

function GameDetails({ game }: { game: AdminGameProfile }) {
	const location = useLocation();
	const [currentGame, setCurrentGame] = useState(game);
	const [isEditing, setEditing] = useState(false);
	const [isVersionFormOpen, setVersionFormOpen] = useState(false);
	const [editingVersionId, setEditingVersionId] = useState<string>();
	const listingCount = currentGame.versionList.reduce((count, version) => count + version.publicListingList.length, 0);
	useEffect(() => {
		const anchorId = location.hash.slice(1);
		if (anchorId) {
			document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, [currentGame, location.hash]);

	return (
		<>
			<div className="detail-heading">
				<div className="detail-mark"><Gamepad2 size={22}/></div>
				<div><p className="eyebrow">Catalog / Games</p><h1 id="page-title">{currentGame.title}</h1><p className="page-description">{currentGame.slug}</p></div>
				<span className={`publication-state state-${publicationState(currentGame.publishedAt)}`}>{publicationLabel(currentGame.publishedAt)}</span>
				{!isEditing && !isPublished(currentGame.publishedAt) && <Button className="refresh-button" onClick={() => setEditing(true)} size="sm" type="button" variant="outline"><Pencil size={14}/> Edit</Button>}
			</div>
			{isEditing && (
				<GameForm
					game={currentGame}
					onCancel={() => setEditing(false)}
					onSubmit={async (input) => {
						setCurrentGame(await updateAdminGame(currentGame.id, {
							description: input.description,
							featured: input.featured,
							publishedAt: input.publishedAt || null,
							slug: input.slug,
							summary: input.summary,
							title: input.title,
						}));
						setEditing(false);
					}}
					submitLabel="Save changes"
				/>
			)}
			<div className="detail-section">
				<h2>Game profile</h2>
				<dl className="detail-grid">
					<div><dt>Publisher</dt><dd><Link to={`/publishers/${currentGame.publisher.id}`}>{currentGame.publisher.name}</Link></dd></div>
					<div><dt>Slug</dt><dd>{currentGame.slug}</dd></div>
					<div><dt>Featured</dt><dd>{currentGame.featured ? 'Yes' : 'No'}</dd></div>
					<div><dt>Versions</dt><dd>{currentGame.versionList.length}</dd></div>
					<div><dt>Public listings</dt><dd>{listingCount}</dd></div>
					{currentGame.summary && <div><dt>Summary</dt><dd>{currentGame.summary}</dd></div>}
					{currentGame.description && <div className="game-description-field"><dt>Description</dt><dd>{currentGame.description}</dd></div>}
				</dl>
			</div>
			<div className="detail-section">
				<div className="game-catalog-section-heading"><h2>Versions and public listings</h2><Button onClick={() => setVersionFormOpen(!isVersionFormOpen)} size="sm" type="button" variant={isVersionFormOpen ? 'outline' : 'default'}>{isVersionFormOpen ? <X size={14}/> : <Plus size={14}/>} {isVersionFormOpen ? 'Cancel' : 'Add version'}</Button></div>
				{isVersionFormOpen && <GameVersionForm
					onCancel={() => setVersionFormOpen(false)}
					onSubmit={async (input) => {
						setCurrentGame(await createAdminGameVersion(currentGame.id, {
							...input,
							publishedAt: input.publishedAt ?? undefined,
						}));
						setVersionFormOpen(false);
					}}
				/>}
				{currentGame.versionList.length > 0 ? <div className="game-version-list">{currentGame.versionList.map((version) => <section className="game-version" id={`game-version-${version.id}`} key={version.id}>
					<div className="game-version-heading">
						<div><strong>Version {version.publisherVersion}</strong><span>{version.publicListingList.length} public {version.publicListingList.length === 1 ? 'listing' : 'listings'}</span></div>
						<span className={`publication-state state-${publicationState(version.publishedAt)}`}>{publicationLabel(version.publishedAt)}</span>
						{!isPublished(version.publishedAt) && <Button onClick={() => setEditingVersionId(editingVersionId === version.id ? undefined : version.id)} size="sm" type="button" variant="outline">{editingVersionId === version.id ? <X size={13}/> : <Pencil size={13}/>} {editingVersionId === version.id ? 'Cancel' : 'Edit'}</Button>}
					</div>
					{editingVersionId === version.id && <GameVersionForm
						onCancel={() => setEditingVersionId(undefined)}
						onSubmit={async (input) => {
							setCurrentGame(await updateAdminGameVersion(currentGame.id, version.id, input as UpdateAdminGameVersionInput));
							setEditingVersionId(undefined);
						}}
						version={version}
					/>}
					{version.description && <p className="game-version-description">{version.description}</p>}
					<GameVersionListingList gameId={currentGame.id} gameTitle={currentGame.title} onSaved={setCurrentGame} version={version}/>
				</section>)}</div> : <p>No versions have been added to this game.</p>}
			</div>
		</>
	);
}

type AdminGameVersionFormInput = Omit<CreateAdminGameVersionInput, 'publishedAt'> & { publishedAt?: string | null };

function GameVersionForm({
	onCancel,
	onSubmit,
	version,
}: {
	onCancel: () => void;
	onSubmit: (input: AdminGameVersionFormInput) => Promise<void>;
	version?: AdminGameProfile['versionList'][number];
}) {
	const [publisherVersion, setPublisherVersion] = useState(version?.publisherVersion ?? '');
	const [description, setDescription] = useState(version?.description ?? '');
	const [runUrl, setRunUrl] = useState(version?.runUrl ?? '');
	const [publishedAt, setPublishedAt] = useState(toDateTimeInput(version?.publishedAt));
	const [error, setError] = useState<string>();
	const [isSaving, setSaving] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
		event.preventDefault();
		setError(undefined);
		setSaving(true);
		try {
			await onSubmit({
				description: description.trim() || undefined,
				publishedAt: publishedAt ? new Date(publishedAt).toISOString() : version ? null : undefined,
				publisherVersion: publisherVersion.trim(),
				runUrl: runUrl.trim(),
			});
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : 'Game version could not be saved.');
		} finally {
			setSaving(false);
		}
	}

	return (
		<form className="institution-form game-version-form" onSubmit={handleSubmit}>
			<div className="game-version-form-intro">
				<strong>{version ? 'Runtime version details' : 'Set up a runtime version'}</strong>
				<p>Connect this publisher version to the hosted game runtime. Published versions are immutable.</p>
			</div>
			<div className="institution-form-fields game-version-form-fields">
				<label>Publisher version<input autoComplete="off" maxLength={120} onChange={(event) => setPublisherVersion(event.target.value)} required value={publisherVersion}/></label>
				<label>Runtime URL<input autoComplete="url" onChange={(event) => setRunUrl(event.target.value)} placeholder="https://games.example.edu/runtime" required type="url" value={runUrl}/><span>Use the HTTPS URL that serves this game version.</span></label>
				<label className="institution-form-description">Description<textarea maxLength={10000} onChange={(event) => setDescription(event.target.value)} rows={2} value={description}/></label>
				<label>Publication date<input onChange={(event) => setPublishedAt(event.target.value)} type="datetime-local" value={publishedAt}/><span>Leave blank to save as a draft.</span></label>
				<div className="game-version-date-shortcuts institution-form-description">
					<Button onClick={() => setPublishedAt(toDateTimeInput(new Date().toISOString()))} size="sm" type="button" variant="outline">Publish now</Button>
					<Button disabled={!publishedAt} onClick={() => setPublishedAt('')} size="sm" type="button" variant="outline">Clear date</Button>
				</div>
			</div>
			{error && <div className="institution-form-error" role="alert"><AlertCircle size={16}/>{error}</div>}
			<div className="institution-form-actions">
				<Button disabled={isSaving} onClick={onCancel} size="sm" type="button" variant="outline"><X size={14}/> Cancel</Button>
				<Button disabled={isSaving} size="sm" type="submit"><Check size={14}/>{isSaving ? 'Saving...' : version ? 'Save changes' : 'Create version'}</Button>
			</div>
		</form>
	);
}

type AdminGameVersionProfile = AdminGameProfile['versionList'][number];
type AdminGamePublicListingProfile = AdminGameVersionProfile['publicListingList'][number];

function GameVersionListingList({
	gameId,
	gameTitle,
	onSaved,
	version,
}: {
	gameId: string;
	gameTitle: string;
	onSaved: (game: AdminGameProfile) => void;
	version: AdminGameVersionProfile;
}) {
	const [activeForm, setActiveForm] = useState<{ listingId?: string }>();
	const publicListing = activeForm?.listingId
		? version.publicListingList.find((listing) => listing.id === activeForm.listingId)
		: undefined;

	return (
		<div className="game-version-listing-panel">
			<div className="game-listing-title-row"><h3>Public listings</h3><Button onClick={() => setActiveForm({})} size="sm" type="button" variant="outline"><Plus size={13}/> Add listing</Button></div>
			<div className="game-listing-slot-list" aria-label="Public listings for this version">
				{version.publicListingList.map((listing) => <GameListingSlot
					key={listing.id}
					listing={listing}
					onEdit={() => setActiveForm({ listingId: listing.id })}
				/>)}
				{version.publicListingList.length === 0 && <p className="game-empty-note">No public listings for this version.</p>}
			</div>
			{activeForm && <GameListingForm
				gameId={gameId}
				gameTitle={gameTitle}
				onCancel={() => setActiveForm(undefined)}
				onSaved={(game) => {
					onSaved(game);
					setActiveForm(undefined);
				}}
				publicListing={publicListing}
				version={version}
			/>}
		</div>
	);
}

function GameListingSlot({
	listing,
	onEdit,
}: {
	listing: AdminGamePublicListingProfile;
	onEdit: () => void;
}) {
	const priceGroupDescription = listing.priceGroupList
		.map((priceGroup) => `${priceGroup.languageList.join(', ')}: ${formatPrice(priceGroup.price)}`)
		.join(' · ');
	const isPublishedListing = isPublished(listing.publishedAt);

	return (
		<div className="game-listing-slot">
			<div className="game-listing-slot-label"><strong>Public listing</strong><small>{priceGroupDescription}</small></div>
			<div className="game-listing-slot-value">
				<strong>{listing.available ? 'Available to acquire' : 'Unavailable'}</strong>
				<small>{formatDateTime(listing.startAt)} – {formatDateTime(listing.endAt)}</small>
			</div>
			<span className={`publication-state state-${publicationState(listing.publishedAt)}`}>{publicationLabel(listing.publishedAt)}</span>
			<Button onClick={onEdit} size="sm" type="button" variant="outline">{isPublishedListing ? 'Close' : <><Pencil/> Edit</>}</Button>
		</div>
	);
}

function GameListingForm({
	gameId,
	gameTitle,
	onCancel,
	onSaved,
	publicListing,
	version,
}: {
	gameId: string;
	gameTitle: string;
	onCancel: () => void;
	onSaved: (game: AdminGameProfile) => void;
	publicListing?: AdminGamePublicListingProfile;
	version: AdminGameVersionProfile;
}) {
	const existingListing = publicListing;
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [priceGroupFormList, setPriceGroupFormList] = useState(() => existingListing
		? existingListing.priceGroupList.map((priceGroup) => ({
			key: priceGroup.id,
			languages: priceGroup.languageList.join(', '),
			price: (priceGroup.price.minorUnitAmount / 100).toFixed(2),
		}))
		: [{ key: crypto.randomUUID(), languages: 'en', price: '' }]);
	const [available, setAvailable] = useState(publicListing?.available ?? true);
	const [startAt, setStartAt] = useState(toDateTimeInput(existingListing?.startAt ?? new Date().toISOString()));
	const [endAt, setEndAt] = useState(toDateTimeInput(existingListing?.endAt));
	const [publishedAt, setPublishedAt] = useState(toDateTimeInput(existingListing?.publishedAt));
	const [error, setError] = useState<string>();
	const [isSaving, setSaving] = useState(false);
	const isClosingPublishedListing = Boolean(existingListing && isPublished(existingListing.publishedAt));

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) {
			return;
		}
		dialog.showModal();
		return () => {
			if (dialog.open) {
				dialog.close();
			}
		};
	}, []);

	async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
		event.preventDefault();
		setError(undefined);
		if (isClosingPublishedListing && existingListing) {
			if (!endAt) {
				setError('Choose an end date to close this listing.');
				return;
			}
			const closingDate = new Date(endAt);
			const listingStartDate = new Date(existingListing.startAt);
			const currentEndDate = existingListing.endAt ? new Date(existingListing.endAt) : undefined;
			if (closingDate <= listingStartDate || (currentEndDate && closingDate >= currentEndDate)) {
				setError('The closing date must fall after the listing start and before its current end date.');
				return;
			}
			setSaving(true);
			try {
				onSaved(await updateAdminPublicGameListing(gameId, existingListing.id, { endAt: new Date(endAt).toISOString() }));
			} catch (requestError) {
				setError(requestError instanceof Error ? requestError.message : 'Listing could not be closed.');
			} finally {
				setSaving(false);
			}
			return;
		}
		if (endAt && new Date(endAt) <= new Date(startAt)) {
			setError('Listing end date must be after its start date.');
			return;
		}

		const priceGroupList = priceGroupFormList.map((priceGroup) => ({
			languageList: priceGroup.languages.split(',').map((language) => language.trim()).filter(Boolean),
			price: { currency: 'USD', minorUnitAmount: Math.round(Number(priceGroup.price) * 100) },
		}));
		if (priceGroupList.some((priceGroup) => priceGroup.languageList.length === 0)) {
			setError('Each price group needs at least one language.');
			return;
		}
		const normalizedLanguageList = priceGroupList.flatMap((priceGroup) => priceGroup.languageList.map((language) => language.toLowerCase()));
		if (new Set(normalizedLanguageList).size !== normalizedLanguageList.length) {
			setError('A language can only appear in one price group.');
			return;
		}
		setSaving(true);
		try {
			if (publicListing) {
				const input: UpdateAdminPublicGameListingInput = {
					available,
					endAt: endAt ? new Date(endAt).toISOString() : null,
					priceGroupList,
					publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
					startAt: new Date(startAt).toISOString(),
				};
				onSaved(await updateAdminPublicGameListing(gameId, publicListing.id, input));
			} else {
				const input: CreateAdminPublicGameListingInput = {
					available,
					endAt: endAt ? new Date(endAt).toISOString() : undefined,
					gameVersionId: version.id,
					priceGroupList,
					publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
					startAt: new Date(startAt).toISOString(),
				};
				onSaved(await createAdminPublicGameListing(gameId, input));
			}
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : 'Listing could not be saved.');
		} finally {
			setSaving(false);
		}
	}

	return (
		<dialog aria-labelledby="game-listing-dialog-title" className="game-listing-dialog" onCancel={(event) => {
			event.preventDefault();
			onCancel();
		}} ref={dialogRef}>
			<div className="game-listing-dialog-content">
				<div className="game-listing-dialog-heading">
					<div><p className="eyebrow">{isClosingPublishedListing ? 'Close listing' : existingListing ? 'Edit listing' : 'New listing'}</p><h2 id="game-listing-dialog-title">Public listing</h2></div>
					<Button aria-label="Close listing form" onClick={onCancel} size="icon" type="button" variant="outline"><X/></Button>
				</div>
				<div className="game-listing-version-reference">
					<span>Game version</span>
					<Link to={`/games/${gameId}#game-version-${version.id}`}>{gameTitle} · Version {version.publisherVersion}<ExternalLink aria-hidden="true" size={14}/></Link>
				</div>
				<form className="institution-form game-listing-form" onSubmit={handleSubmit}>
					{isClosingPublishedListing ? <>
						<p className="game-empty-note">Published terms are fixed. Choose an end date earlier than the listing’s current end date.</p>
						<label className="game-listing-publication-field">End date<input max={existingListing?.endAt ? toDateTimeInput(existingListing.endAt) : undefined} min={existingListing?.startAt ? toDateTimeInput(existingListing.startAt) : undefined} onChange={(event) => setEndAt(event.target.value)} required type="datetime-local" value={endAt}/></label>
					</> : <>
						<div className="game-listing-form-intro">
							<strong>Language pricing</strong>
							<p>Group languages that share a price. Each language can belong to one group only.</p>
						</div>
						<div className="game-listing-price-group-list">
							{priceGroupFormList.map((priceGroup, index) => <div className="game-listing-price-group" key={priceGroup.key}>
								<div className="game-listing-price-group-heading">
									<strong>Price group {index + 1}</strong>
									{priceGroupFormList.length > 1 && <Button aria-label={`Remove price group ${index + 1}`} onClick={() => setPriceGroupFormList((current) => current.filter((_, itemIndex) => itemIndex !== index))} size="icon" type="button" variant="outline"><X aria-hidden="true"/></Button>}
								</div>
								<label>Languages<input autoComplete="off" onChange={(event) => setPriceGroupFormList((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, languages: event.target.value } : item))} placeholder="en, en-CA, fr" required value={priceGroup.languages}/><span>Comma-separated language tags, for example en or fr-CA.</span></label>
								<label>Price per learner (USD)<input min="0" onChange={(event) => setPriceGroupFormList((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, price: event.target.value } : item))} required step="0.01" type="number" value={priceGroup.price}/></label>
							</div>)}
							<Button onClick={() => setPriceGroupFormList((current) => [...current, { key: crypto.randomUUID(), languages: '', price: '' }])} size="sm" type="button" variant="outline"><Plus size={14}/> Add price group</Button>
						</div>
						<div className="institution-form-fields">
							<label className="game-featured-toggle"><input checked={available} onChange={(event) => setAvailable(event.target.checked)} type="checkbox"/><span>Available to acquire</span></label>
							<label>Starts<input onChange={(event) => setStartAt(event.target.value)} required type="datetime-local" value={startAt}/></label>
							<label>Ends<input min={startAt} onChange={(event) => setEndAt(event.target.value)} type="datetime-local" value={endAt}/><span>Leave blank for no end date.</span></label>
						</div>
						<label className="game-listing-publication-field">Publication date<input onChange={(event) => setPublishedAt(event.target.value)} type="datetime-local" value={publishedAt}/><span>Leave blank for a draft. Dates use your local time; published terms can only be closed early.</span></label>
						<div aria-label="Publication date shortcuts" className="game-listing-date-shortcuts">
							<Button onClick={() => setPublishedAt(toDateTimeInput(new Date().toISOString()))} size="sm" type="button" variant="outline">Set to now</Button>
							<Button onClick={() => setPublishedAt(tomorrowAtNine())} size="sm" type="button" variant="outline">Tomorrow, 9:00 AM</Button>
							<Button disabled={!publishedAt} onClick={() => setPublishedAt('')} size="sm" type="button" variant="outline">Clear</Button>
						</div>
					</>}
					{error && <div className="institution-form-error" role="alert"><AlertCircle size={16}/>{error}</div>}
					<div className="institution-form-actions">
						<Button disabled={isSaving} onClick={onCancel} size="sm" type="button" variant="outline"><X size={14}/> Cancel</Button>
						<Button disabled={isSaving} size="sm" type="submit"><Check size={14}/>{isSaving ? 'Saving...' : isClosingPublishedListing ? 'Close listing' : existingListing ? 'Save listing' : 'Create listing'}</Button>
					</div>
				</form>
			</div>
		</dialog>
	);
}

function tomorrowAtNine(): string {
	const date = new Date();
	date.setDate(date.getDate() + 1);
	date.setHours(9, 0, 0, 0);
	return toDateTimeInput(date.toISOString());
}

function toDateTimeInput(value?: string): string {
	if (!value) {
		return '';
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return '';
	}
	date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
	return date.toISOString().slice(0, 16);
}

function GameForm({
	game,
	initialPublisherId,
	onCancel,
	onSubmit,
	submitLabel,
}: {
	game?: AdminGameProfile;
	initialPublisherId?: string;
	onCancel: () => void;
	onSubmit: (input: CreateAdminGameInput) => Promise<void>;
	submitLabel: string;
}) {
	const [publishers, setPublishers] = useState<Publisher[]>([]);
	const [publisherId, setPublisherId] = useState(game?.publisher.id ?? initialPublisherId ?? '');
	const [title, setTitle] = useState(game?.title ?? '');
	const [slug, setSlug] = useState(game?.slug ?? '');
	const [slugEdited, setSlugEdited] = useState(Boolean(game));
	const [summary, setSummary] = useState(game?.summary ?? '');
	const [description, setDescription] = useState(game?.description ?? '');
	const [featured, setFeatured] = useState(game?.featured ?? false);
	const [publishedAt, setPublishedAt] = useState(toDateTimeInput(game?.publishedAt));
	const [error, setError] = useState<string>();
	const [isLoadingPublishers, setLoadingPublishers] = useState(!game);
	const [isSaving, setSaving] = useState(false);

	useEffect(() => {
		if (game) {
			return;
		}
		const controller = new AbortController();
		getAllPublishers(controller.signal)
			.then((publisherList) => {
				setPublishers(publisherList);
				setPublisherId((current) => current || initialPublisherId || publisherList[0]?.id || '');
			})
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Publishers could not be loaded.');
			})
			.finally(() => setLoadingPublishers(false));

		return () => controller.abort();
	}, [game, initialPublisherId]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
		event.preventDefault();
		setError(undefined);
		setSaving(true);
		try {
			await onSubmit({
				description: description.trim(),
				featured,
				publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
				publisherId: game?.publisher.id ?? publisherId,
				slug: slug.trim(),
				summary: summary.trim(),
				title: title.trim(),
			});
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : 'Game could not be saved.');
		} finally {
			setSaving(false);
		}
	}

	return (
		<form className="institution-form" onSubmit={handleSubmit}>
			<div className="institution-form-fields">
				<label>Title<input autoComplete="off" maxLength={160} onChange={(event) => {
					const value = event.target.value;
					setTitle(value);
					if (!slugEdited) {
						setSlug(value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
					}
				}} required value={title}/></label>
				<label>Slug<input aria-label="Game slug" maxLength={160} onChange={(event) => {
					setSlugEdited(true);
					setSlug(event.target.value.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, ''));
				}} pattern="[a-z0-9]+(-[a-z0-9]+)*" required value={slug}/></label>
				{!game && <label>Publisher<select disabled={isLoadingPublishers} onChange={(event) => setPublisherId(event.target.value)} required value={publisherId}>
					<option disabled value="">Select a publisher</option>
					{publishers.map((publisher) => <option key={publisher.id} value={publisher.id}>{publisher.name}</option>)}
				</select></label>}
				<label>Summary<input maxLength={500} onChange={(event) => setSummary(event.target.value)} value={summary}/></label>
				<label className="institution-form-description">Description<textarea maxLength={10000} onChange={(event) => setDescription(event.target.value)} rows={3} value={description}/></label>
				<label className="game-featured-toggle"><input checked={featured} onChange={(event) => setFeatured(event.target.checked)} type="checkbox"/><span>Featured game</span></label>
				<label>Publish at<input onChange={(event) => setPublishedAt(event.target.value)} type="datetime-local" value={publishedAt}/></label>
			</div>
			{error && <div className="institution-form-error" role="alert"><AlertCircle size={16}/>{error}</div>}
			<div className="institution-form-actions">
				<Button disabled={isSaving} onClick={onCancel} size="sm" type="button" variant="outline"><X size={14}/> Cancel</Button>
				<Button disabled={isSaving || isLoadingPublishers || (!game && !publisherId)} size="sm" type="submit"><Check size={14}/>{isSaving ? 'Saving...' : submitLabel}</Button>
			</div>
		</form>
	);
}