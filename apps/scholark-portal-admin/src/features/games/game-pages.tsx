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
	createAdminInstitutionGameOffer,
	type CreateAdminInstitutionGameOfferInput,
	createAdminPublicGameOffer,
	type CreateAdminPublicGameOfferInput,
	getAdminGame,
	getAdminGameList,
	getAllPublishers,
	getPublisher,
	type Publisher,
	updateAdminGame,
	updateAdminGameVersion,
	type UpdateAdminGameVersionInput,
	updateAdminInstitutionGameOffer,
	type UpdateAdminInstitutionGameOfferInput,
	updateAdminPublicGameOffer,
	type UpdateAdminPublicGameOfferInput,
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

function isPublished(publishedAt?: string): boolean {
	return Boolean(publishedAt && new Date(publishedAt).getTime() <= Date.now());
}

function formatPrice(price: { currency: string; minorUnitAmount: number }): string {
	return new Intl.NumberFormat(undefined, {
		currency: price.currency,
		style: 'currency',
	}).format(price.minorUnitAmount / 100);
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
					<p className="page-description">Review catalog records, publication states, versions, and offers.</p>
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
	const [currentGame, setCurrentGame] = useState(game);
	const [isEditing, setEditing] = useState(false);
	const [isVersionFormOpen, setVersionFormOpen] = useState(false);
	const [editingVersionId, setEditingVersionId] = useState<string>();
	const variantCount = currentGame.versionList.reduce((count, version) => count + version.variantList.length, 0);
	const offerCount = currentGame.versionList.reduce((count, version) => count + version.variantList.reduce((sum, variant) => sum + variant.publicOfferList.length + variant.institutionOfferList.length, 0), 0);

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
					<div><dt>Variants</dt><dd>{variantCount}</dd></div>
					<div><dt>Offers</dt><dd>{offerCount}</dd></div>
					{currentGame.summary && <div><dt>Summary</dt><dd>{currentGame.summary}</dd></div>}
					{currentGame.description && <div className="game-description-field"><dt>Description</dt><dd>{currentGame.description}</dd></div>}
				</dl>
			</div>
			<div className="detail-section">
				<div className="game-catalog-section-heading"><h2>Versions and offers</h2><Button onClick={() => setVersionFormOpen(!isVersionFormOpen)} size="sm" type="button" variant={isVersionFormOpen ? 'outline' : 'default'}>{isVersionFormOpen ? <X size={14}/> : <Plus size={14}/>} {isVersionFormOpen ? 'Cancel' : 'Add version'}</Button></div>
				{isVersionFormOpen && <GameVersionForm
					onCancel={() => setVersionFormOpen(false)}
					onSubmit={async (input) => {
						setCurrentGame(await createAdminGameVersion(currentGame.id, {
							...input,
							publishedAt: input.publishedAt ?? undefined,
							variantList: input.variantList.map(({ language, mode }) => ({ language, mode })),
						}));
						setVersionFormOpen(false);
					}}
				/>}
				{currentGame.versionList.length > 0 ? <div className="game-version-list">{currentGame.versionList.map((version) => <section className="game-version" key={version.id}>
					<div className="game-version-heading">
						<div><strong>Version {version.publisherVersion}</strong><span>{version.variantList.length} {version.variantList.length === 1 ? 'variant' : 'variants'}</span></div>
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
					{version.variantList.length > 0 ? <div className="game-variant-list">{version.variantList.map((variant) => <GameVariantCard gameId={currentGame.id} key={variant.id} onSaved={setCurrentGame} variant={variant}/>)}</div> : <p className="game-empty-note">No variants for this version.</p>}
				</section>)}</div> : <p>No versions have been added to this game.</p>}
			</div>
		</>
	);
}

function GameVersionForm({
	onCancel,
	onSubmit,
	version,
}: {
	onCancel: () => void;
	onSubmit: (input: Omit<CreateAdminGameVersionInput, 'publishedAt' | 'variantList'> & { publishedAt?: string | null; variantList: { id?: string; language: string; mode: 'default' | 'game_based_course' }[] }) => Promise<void>;
	version?: AdminGameProfile['versionList'][number];
}) {
	type VariantFormRow = { id?: string; key: string; language: string; mode: 'default' | 'game_based_course' };
	const [publisherVersion, setPublisherVersion] = useState(version?.publisherVersion ?? '');
	const [description, setDescription] = useState(version?.description ?? '');
	const [runUrl, setRunUrl] = useState(version?.runUrl ?? '');
	const [publishedAt, setPublishedAt] = useState(toDateTimeInput(version?.publishedAt));
	const [variantList, setVariantList] = useState<VariantFormRow[]>(() => version
		? version.variantList.map((variant) => ({ id: variant.id, key: variant.id, language: variant.language, mode: variant.mode }))
		: [{ key: crypto.randomUUID(), language: 'en', mode: 'default' as const }]);
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
				variantList: variantList.map(({ id, language, mode }) => ({
					...(version && id ? { id } : {}),
					language: language.trim(),
					mode,
				})),
			});
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : 'Game version could not be saved.');
		} finally {
			setSaving(false);
		}
	}

	return (
		<form className="institution-form game-version-form" onSubmit={handleSubmit}>
			<div className="institution-form-fields">
				<label>Publisher version<input autoComplete="off" maxLength={120} onChange={(event) => setPublisherVersion(event.target.value)} required value={publisherVersion}/></label>
				<label>Runtime URL<input onChange={(event) => setRunUrl(event.target.value)} required type="url" value={runUrl}/></label>
				<label className="institution-form-description">Description<textarea maxLength={10000} onChange={(event) => setDescription(event.target.value)} rows={2} value={description}/></label>
				<label>Publication date<input onChange={(event) => setPublishedAt(event.target.value)} type="datetime-local" value={publishedAt}/></label>
			</div>
			<div className="game-version-variant-editor">
				<div className="game-offer-title-row"><h3>Variants</h3><Button onClick={() => setVariantList((current) => [...current, { key: crypto.randomUUID(), language: '', mode: 'default' }])} size="sm" type="button" variant="outline"><Plus size={13}/> Add variant</Button></div>
				{variantList.map((variant, index) => <div className="game-version-variant-row" key={variant.key}>
					<label>Language<input autoComplete="off" maxLength={32} onChange={(event) => setVariantList((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, language: event.target.value } : item))} required value={variant.language}/></label>
					<label>Mode<select onChange={(event) => setVariantList((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, mode: event.target.value as 'default' | 'game_based_course' } : item))} value={variant.mode}><option value="default">Default</option><option value="game_based_course">Game-based course</option></select></label>
					{variantList.length > 1 && <button aria-label={`Remove variant ${index + 1}`} className="game-offer-action" onClick={() => setVariantList((current) => current.filter((_, itemIndex) => itemIndex !== index))} title="Remove variant" type="button"><X size={13}/></button>}
				</div>)}
			</div>
			{error && <div className="institution-form-error" role="alert"><AlertCircle size={16}/>{error}</div>}
			<div className="institution-form-actions">
				<Button disabled={isSaving} onClick={onCancel} size="sm" type="button" variant="outline"><X size={14}/> Cancel</Button>
				<Button disabled={isSaving} size="sm" type="submit"><Check size={14}/>{isSaving ? 'Saving...' : version ? 'Save changes' : 'Create version'}</Button>
			</div>
		</form>
	);
}

type AdminGameVariantProfile = AdminGameProfile['versionList'][number]['variantList'][number];
type AdminGamePublicOfferProfile = AdminGameVariantProfile['publicOfferList'][number];
type AdminGameInstitutionOfferProfile = AdminGameVariantProfile['institutionOfferList'][number];

function GameVariantCard({
	gameId,
	onSaved,
	variant,
}: {
	gameId: string;
	onSaved: (game: AdminGameProfile) => void;
	variant: AdminGameVariantProfile;
}) {
	const [activeForm, setActiveForm] = useState<{ type: 'public' | 'institution'; offerId?: string; designatedPayor?: AdminGameInstitutionOfferProfile['designatedPayor'] }>();
	const availableInstitutionPayorList = (['student', 'institution'] as const).filter((payor) => !variant.institutionOfferList.some((offer) => offer.designatedPayor === payor && offer.id !== activeForm?.offerId));
	const publicOfferList = variant.publicOfferList;
	const publicOffer = publicOfferList[0];

	return (
		<div className="game-variant">
			<div className="game-variant-heading"><strong>{variant.language}</strong><span>{variant.mode.replaceAll('_', ' ')}</span></div>
			<div className="game-offer-slot-list" aria-label="Offers for this variant">
				<GameOfferSlot
					description="Individual learner checkout"
					label="Public offer"
					onAdd={() => setActiveForm({ type: 'public' })}
					onEdit={publicOffer && !isPublished(publicOffer.publishedAt) ? () => setActiveForm({ offerId: publicOffer.id, type: 'public' }) : undefined}
					offer={publicOffer}
					duplicateCount={publicOfferList.length}
				/>
				{(['student', 'institution'] as const).map((payor) => {
					const offer = variant.institutionOfferList.find((item) => item.designatedPayor === payor);
					return <GameOfferSlot
						description={payor === 'student' ? 'Student pays for access' : 'Institution pays for access'}
						institutionOffer={offer}
						key={payor}
						label={`${payor === 'student' ? 'Student' : 'Institution'} offer`}
						onAdd={() => setActiveForm({ designatedPayor: payor, type: 'institution' })}
						onEdit={offer && !isPublished(offer.publishedAt) ? () => setActiveForm({ designatedPayor: payor, offerId: offer.id, type: 'institution' }) : undefined}
					/>
				})}
			</div>
			{activeForm && <GameOfferForm
				gameId={gameId}
				onCancel={() => setActiveForm(undefined)}
				onSaved={(game) => {
					onSaved(game);
					setActiveForm(undefined);
				}}
				initialDesignatedPayor={activeForm.designatedPayor}
				availableInstitutionPayorList={availableInstitutionPayorList}
				publicOffer={activeForm.type === 'public' && activeForm.offerId ? publicOffer : undefined}
				institutionOffer={activeForm.type === 'institution' && activeForm.offerId ? variant.institutionOfferList.find((offer) => offer.id === activeForm.offerId) : undefined}
				type={activeForm.type}
				variantId={variant.id}
			/>}
		</div>
	);
}

function GameOfferSlot({
	description,
	institutionOffer,
	label,
	onAdd,
	onEdit,
	offer,
	duplicateCount = 1,
}: {
	description: string;
	duplicateCount?: number;
	institutionOffer?: AdminGameInstitutionOfferProfile;
	label: string;
	onAdd: () => void;
	onEdit?: () => void;
	offer?: AdminGamePublicOfferProfile;
}) {
	const currentOffer = offer ?? institutionOffer;
	return (
		<div className="game-offer-slot">
			<div className="game-offer-slot-label"><strong>{label}</strong><small>{description}</small></div>
			{currentOffer ? <>
				<div className="game-offer-slot-value">
					<strong>{formatPrice(currentOffer.price)}</strong>
					{institutionOffer ? <small>{institutionOffer.licenseDurationDays} days{typeof institutionOffer.allocatedLicenseQuantity === 'number' ? ` · ${institutionOffer.allocatedLicenseQuantity} licenses` : ' · No quantity limit'}</small> : <small>{offer?.available ? 'Available to acquire' : 'Unavailable'}</small>}
				</div>
				<span className={`publication-state state-${publicationState(currentOffer.publishedAt)}`}>{publicationLabel(currentOffer.publishedAt)}</span>
				{onEdit ? <Button onClick={onEdit} size="sm" type="button" variant="outline"><Pencil/> Edit</Button> : <span className="game-offer-slot-locked">Read-only</span>}
				{duplicateCount > 1 && <p className="game-offer-duplicate-warning" role="alert">{duplicateCount} public offers exist for this variant; only one is allowed. Review the legacy duplicate before changing this slot.</p>}
			</> : <>
				<span className="game-offer-slot-empty">Not set up</span>
				<span className="game-offer-slot-empty-state">No offer</span>
				<Button onClick={onAdd} size="sm" type="button" variant="outline"><Plus/> Add offer</Button>
			</>}
		</div>
	);
}

function GameOfferForm({
	gameId,
	initialDesignatedPayor,
	availableInstitutionPayorList,
	onCancel,
	onSaved,
	institutionOffer,
	publicOffer,
	type,
	variantId,
}: {
	gameId: string;
	initialDesignatedPayor?: AdminGameInstitutionOfferProfile['designatedPayor'];
	availableInstitutionPayorList: AdminGameInstitutionOfferProfile['designatedPayor'][];
	institutionOffer?: AdminGameInstitutionOfferProfile;
	onCancel: () => void;
	onSaved: (game: AdminGameProfile) => void;
	publicOffer?: AdminGamePublicOfferProfile;
	type: 'public' | 'institution';
	variantId: string;
}) {
	const existingOffer = publicOffer ?? institutionOffer;
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [price, setPrice] = useState(existingOffer ? (existingOffer.price.minorUnitAmount / 100).toFixed(2) : '');
	const [available, setAvailable] = useState(publicOffer?.available ?? true);
	const [publishedAt, setPublishedAt] = useState(toDateTimeInput(existingOffer?.publishedAt));
	const [designatedPayor, setDesignatedPayor] = useState<AdminGameInstitutionOfferProfile['designatedPayor']>(institutionOffer?.designatedPayor ?? initialDesignatedPayor ?? 'student');
	const [licenseDurationDays, setLicenseDurationDays] = useState(String(institutionOffer?.licenseDurationDays ?? 120));
	const [allocatedLicenseQuantity, setAllocatedLicenseQuantity] = useState(typeof institutionOffer?.allocatedLicenseQuantity === 'number' ? String(institutionOffer.allocatedLicenseQuantity) : '');
	const [error, setError] = useState<string>();
	const [isSaving, setSaving] = useState(false);

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
		setSaving(true);
		const inputPrice = { currency: 'USD', minorUnitAmount: Math.round(Number(price) * 100) };
		try {
			if (type === 'public') {
				if (publicOffer) {
					const input: UpdateAdminPublicGameOfferInput = {
						available,
						price: inputPrice,
						publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
					};
					onSaved(await updateAdminPublicGameOffer(gameId, publicOffer.id, input));
				} else {
					const input: CreateAdminPublicGameOfferInput = {
						available,
						gameVariantId: variantId,
						price: inputPrice,
						publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
					};
					onSaved(await createAdminPublicGameOffer(gameId, input));
				}
			} else if (institutionOffer) {
				const input: UpdateAdminInstitutionGameOfferInput = {
					allocatedLicenseQuantity: allocatedLicenseQuantity ? Number(allocatedLicenseQuantity) : null,
					designatedPayor,
					licenseDurationDays: Number(licenseDurationDays),
					price: inputPrice,
					publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
				};
				onSaved(await updateAdminInstitutionGameOffer(gameId, institutionOffer.id, input));
			} else {
				const input: CreateAdminInstitutionGameOfferInput = {
					allocatedLicenseQuantity: allocatedLicenseQuantity ? Number(allocatedLicenseQuantity) : undefined,
					designatedPayor,
					gameVariantId: variantId,
					licenseDurationDays: Number(licenseDurationDays),
					price: inputPrice,
					publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
				};
				onSaved(await createAdminInstitutionGameOffer(gameId, input));
			}
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : 'Offer could not be saved.');
		} finally {
			setSaving(false);
		}
	}

	return (
		<dialog aria-labelledby="game-offer-dialog-title" className="game-offer-dialog" onCancel={(event) => {
			event.preventDefault();
			onCancel();
		}} ref={dialogRef}>
			<div className="game-offer-dialog-content">
				<div className="game-offer-dialog-heading">
					<div><p className="eyebrow">{existingOffer ? 'Edit offer' : 'New offer'}</p><h2 id="game-offer-dialog-title">{type === 'public' ? 'Public offer' : `${designatedPayor === 'student' ? 'Student' : 'Institution'} offer`}</h2></div>
					<Button aria-label="Close offer form" onClick={onCancel} size="icon" type="button" variant="outline"><X/></Button>
				</div>
				<form className="institution-form game-offer-form" onSubmit={handleSubmit}>
					<div className="institution-form-fields">
						<label>Price (USD)<input min="0" onChange={(event) => setPrice(event.target.value)} required step="0.01" type="number" value={price}/></label>
						{type === 'public' ? <>
							<label className="game-featured-toggle"><input checked={available} onChange={(event) => setAvailable(event.target.checked)} type="checkbox"/><span>Available to acquire</span></label>
						</> : <>
							{institutionOffer ? <label>Designated payor<select onChange={(event) => setDesignatedPayor(event.target.value as AdminGameInstitutionOfferProfile['designatedPayor'])} value={designatedPayor}>{availableInstitutionPayorList.map((payor) => <option key={payor} value={payor}>{payor === 'student' ? 'Student' : 'Institution'}</option>)}</select></label> : <div className="game-offer-readonly-field"><span>Designated payor</span><strong>{designatedPayor === 'student' ? 'Student' : 'Institution'}</strong></div>}
							<label>License duration (days)<input min="1" onChange={(event) => setLicenseDurationDays(event.target.value)} required step="1" type="number" value={licenseDurationDays}/></label>
							<label>License quantity<input min="0" onChange={(event) => setAllocatedLicenseQuantity(event.target.value)} step="1" type="number" value={allocatedLicenseQuantity}/></label>
						</>}
					</div>
					<label className="game-offer-publication-field">Publication date<input onChange={(event) => setPublishedAt(event.target.value)} type="datetime-local" value={publishedAt}/><span>Leave blank for a draft. Dates use your local time; published offers cannot be edited.</span></label>
					<div aria-label="Publication date shortcuts" className="game-offer-date-shortcuts">
						<Button onClick={() => setPublishedAt(toDateTimeInput(new Date().toISOString()))} size="sm" type="button" variant="outline">Set to now</Button>
						<Button onClick={() => setPublishedAt(tomorrowAtNine())} size="sm" type="button" variant="outline">Tomorrow, 9:00 AM</Button>
						<Button disabled={!publishedAt} onClick={() => setPublishedAt('')} size="sm" type="button" variant="outline">Clear</Button>
					</div>
					{error && <div className="institution-form-error" role="alert"><AlertCircle size={16}/>{error}</div>}
					<div className="institution-form-actions">
						<Button disabled={isSaving} onClick={onCancel} size="sm" type="button" variant="outline"><X size={14}/> Cancel</Button>
						<Button disabled={isSaving} size="sm" type="submit"><Check size={14}/>{isSaving ? 'Saving...' : existingOffer ? 'Save offer' : 'Create offer'}</Button>
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