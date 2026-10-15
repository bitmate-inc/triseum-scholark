import { Button } from '@repo/ui/button';
import {
	AlertCircle,
	ArrowLeft,
	Check,
	ChevronLeft,
	ChevronRight,
	ExternalLink,
	Gamepad2,
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
	useParams,
	useSearchParams
} from 'react-router-dom';

import {
	type AdminGameListingPrice,
	type AdminGameVersionOption,
	type Classroom,
	type ClassroomGameListing,
	type ClassroomGameListingListResponse,
	createAdminClassroomGameListing,
	type CreateAdminClassroomGameListingInput,
	getAllAdminGameVersions,
	getAllClassrooms,
	getClassroomGameListing,
	getClassroomGameListingList,
	updateAdminClassroomGameListing,
} from '../../lib/admin-api';

const pageSize = 10;
const dateTimeFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

function listingState(classroomGameListing: ClassroomGameListing): string {
	const now = Date.now();
	if (!classroomGameListing.publishedAt || new Date(classroomGameListing.publishedAt).getTime() > now) {
		return 'unpublished';
	}
	if (new Date(classroomGameListing.endAt).getTime() < now) {
		return 'expired';
	}
	if (new Date(classroomGameListing.startAt).getTime() > now) {
		return 'scheduled';
	}
	return 'active';
}

function formatDate(value?: string): string {
	return value ? dateTimeFormat.format(new Date(value)) : 'Not published';
}

function formatPrice(price?: { currency: string; minorUnitAmount: number }): string {
	if (!price) {
		return 'No student price';
	}
	return new Intl.NumberFormat(undefined, {
		currency: price.currency,
		style: 'currency',
	}).format(price.minorUnitAmount / 100);
}

function customizationOptionLabel(customization: AdminGameVersionOption['customizationList'][number], index: number): string {
	const publicationDate = customization.publishedAt ? new Date(customization.publishedAt) : undefined;
	const publicationLabel = !publicationDate
		? 'Draft'
		: publicationDate.getTime() > Date.now()
			? `Scheduled ${dateTimeFormat.format(publicationDate)}`
			: `Published ${dateTimeFormat.format(publicationDate)}`;
	const createdLabel = customization.createdAt ? ` · added ${dateTimeFormat.format(new Date(customization.createdAt))}` : '';
	return `Customization ${index + 1} · ${publicationLabel}${createdLabel}`;
}

function classroomCustomizationLabel(classroomGameListing: ClassroomGameListing): string {
	if (!classroomGameListing.customizationId) {
		return 'Default game configuration';
	}

	const createdLabel = classroomGameListing.customizationCreatedAt
		? ` · added ${dateTimeFormat.format(new Date(classroomGameListing.customizationCreatedAt))}`
		: '';
	if (!classroomGameListing.customizationPublishedAt) {
		return `Draft game customization${createdLabel}`;
	}

	const publishedAt = new Date(classroomGameListing.customizationPublishedAt);
	const statusLabel = publishedAt.getTime() > Date.now()
		? `Scheduled ${dateTimeFormat.format(publishedAt)}`
		: `Published ${dateTimeFormat.format(publishedAt)}`;
	return `Game customization · ${statusLabel}${createdLabel}`;
}

export function ClassroomGameListingListPage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const institutionId = searchParams.get('institutionId') ?? '';
	const classroomId = searchParams.get('classroomId') ?? '';
	const [search, setSearch] = useState('');
	const [offset, setOffset] = useState(0);
	const [reloadKey, setReloadKey] = useState(0);
	const [result, setResult] = useState<ClassroomGameListingListResponse>();
	const [isCreateOpen, setCreateOpen] = useState(false);
	const [error, setError] = useState<string>();
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(undefined);
		getClassroomGameListingList(search, offset, institutionId, classroomId, controller.signal)
			.then(setResult)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Classroom games could not be loaded.');
			})
			.finally(() => setLoading(false));

		return () => controller.abort();
	}, [classroomId, institutionId, offset, reloadKey, search]);

	const totalItemCount = result?.totalItemCount ?? 0;
	const firstItem = totalItemCount === 0 ? 0 : offset + 1;
	const lastItem = Math.min(offset + pageSize, totalItemCount);

	return (
		<section className="page-content" aria-labelledby="page-title">
			<div className="page-heading">
				<div>
					<p className="eyebrow">Education</p>
					<h1 id="page-title">Classroom game listings</h1>
					<p className="page-description">Manage game access terms for specific classrooms.</p>
				</div>
				<div className="institution-heading-actions">
					<Button onClick={() => setCreateOpen(!isCreateOpen)} size="sm" type="button" variant={isCreateOpen ? 'outline' : 'default'}>{isCreateOpen ? <X size={14}/> : <Plus size={14}/>} {isCreateOpen ? 'Cancel' : 'Add listing'}</Button>
					<Button className="refresh-button" onClick={() => setReloadKey(reloadKey + 1)} size="sm" type="button" variant="outline"><RefreshCw size={15}/> Refresh</Button>
				</div>
			</div>
			{isCreateOpen && <ClassroomGameListingForm
				initialClassroomId={classroomId}
				initialGameVersionId=""
				institutionId={institutionId}
				onCancel={() => setCreateOpen(false)}
				onSubmit={async (input) => {
					const listing = await createAdminClassroomGameListing(toCreateClassroomGameListingInput(input));
					setCreateOpen(false);
					navigate(`/classroom-game-listings/${listing.id}`);
				}}
			/>}
			{institutionId && <p className="filter-context">Filtered by institution <Link to={`/institutions/${institutionId}`}>view institution <ExternalLink size={13}/></Link></p>}
			{classroomId && <p className="filter-context">Filtered by classroom <Link to={`/classrooms/${classroomId}`}>view classroom <ExternalLink size={13}/></Link></p>}
			<div className="table-toolbar">
				<label className="search-field">
					<Search aria-hidden="true" size={17}/>
					<input aria-label="Search classroom game listings" onChange={(event) => {
						setSearch(event.target.value);
						setOffset(0);
					}} placeholder="Search games, classrooms" value={search}/>
				</label>
			</div>
			<div className="table-frame">
				<div className="institution-table-header classroom-game-listing-table-header">
					<span>Game</span><span>Classroom</span><span>Institution</span><span>Status</span><span/>
				</div>
				{error && <div className="inline-error" role="alert"><AlertCircle size={17}/><span>{error}</span><Button onClick={() => setReloadKey(reloadKey + 1)} size="sm" variant="outline">Try again</Button></div>}
				{isLoading && <div aria-label="Loading classroom games" className="table-loading"><span/><span/><span/><span/></div>}
				{!isLoading && !error && result?.classroomGameListingList.length === 0 && <div className="empty-state"><div className="empty-mark"><Gamepad2 size={20}/></div><strong>No classroom games found</strong><p>Try a different search or institution.</p></div>}
				{!isLoading && !error && result && result.classroomGameListingList.length > 0 && <div className="institution-rows">{result.classroomGameListingList.map((classroomGameListing) => <ClassroomGameListingRow classroomGameListing={classroomGameListing} key={classroomGameListing.id}/>)}</div>}
			</div>
			<div className="table-pagination">
				<span>{totalItemCount === 0 ? 'No classroom games' : `Showing ${firstItem}–${lastItem} of ${totalItemCount}`}</span>
				<div>
					<Button aria-label="Previous page" disabled={offset === 0 || isLoading} onClick={() => setOffset(Math.max(0, offset - pageSize))} size="icon" variant="outline"><ChevronLeft size={16}/></Button>
					<Button aria-label="Next page" disabled={offset + pageSize >= totalItemCount || isLoading} onClick={() => setOffset(offset + pageSize)} size="icon" variant="outline"><ChevronRight size={16}/></Button>
				</div>
			</div>
		</section>
	);
}

type ClassroomGameListingFormInput = Omit<CreateAdminClassroomGameListingInput, 'customizationId' | 'includedLicenseQuantity' | 'price' | 'publishedAt'> & {
	customizationId?: string | null;
	includedLicenseQuantity?: number | null;
	price?: AdminGameListingPrice | null;
	publishedAt?: string | null;
};

function toCreateClassroomGameListingInput(input: ClassroomGameListingFormInput): CreateAdminClassroomGameListingInput {
	const { customizationId, includedLicenseQuantity, price, publishedAt, ...fields } = input;
	return {
		...fields,
		...(customizationId ? { customizationId } : {}),
		...(typeof includedLicenseQuantity === 'number' ? { includedLicenseQuantity } : {}),
		...(price ? { price } : {}),
		publishedAt: publishedAt ?? undefined,
	};
}

function ClassroomGameListingForm({
	existingListing,
	initialClassroomId,
	initialGameVersionId,
	institutionId,
	onCancel,
	onSubmit,
}: {
	existingListing?: ClassroomGameListing;
	initialClassroomId: string;
	initialGameVersionId: string;
	institutionId: string;
	onCancel: () => void;
	onSubmit: (input: ClassroomGameListingFormInput) => Promise<void>;
}) {
	const [classroomList, setClassroomList] = useState<Classroom[]>([]);
	const [gameVersionList, setGameVersionList] = useState<AdminGameVersionOption[]>([]);
	const [classroomId, setClassroomId] = useState(initialClassroomId);
	const [gameVersionId, setGameVersionId] = useState(existingListing?.gameVersionId ?? initialGameVersionId);
	const [designatedPayor, setDesignatedPayor] = useState<ClassroomGameListing['designatedPayor']>(existingListing?.designatedPayor ?? 'student');
	const [priceAmount, setPriceAmount] = useState(existingListing?.price ? (existingListing.price.minorUnitAmount / 100).toFixed(2) : '');
	const [includedLicenseQuantity, setIncludedLicenseQuantity] = useState(existingListing?.includedLicenseQuantity == null ? '' : String(existingListing.includedLicenseQuantity));
	const [licenseDurationDays, setLicenseDurationDays] = useState(String(existingListing?.licenseDurationDays ?? 120));
	const [customizationId, setCustomizationId] = useState(existingListing?.customizationId ?? '');
	const [startAt, setStartAt] = useState(() => toLocalDateTimeInput(existingListing ? new Date(existingListing.startAt) : new Date()));
	const [endAt, setEndAt] = useState(() => {
		const date = existingListing ? new Date(existingListing.endAt) : new Date();
		if (!existingListing) {
			date.setDate(date.getDate() + 90);
		}
		return toLocalDateTimeInput(date);
	});
	const [publishedAt, setPublishedAt] = useState(() => existingListing?.publishedAt ? toLocalDateTimeInput(new Date(existingListing.publishedAt)) : '');
	const [error, setError] = useState<string>();
	const [isLoading, setLoading] = useState(true);
	const [isSaving, setSaving] = useState(false);
	const selectedGameVersion = gameVersionList.find((version) => version.id === gameVersionId);

	useEffect(() => {
		const controller = new AbortController();
		Promise.all([getAllClassrooms(controller.signal), getAllAdminGameVersions(controller.signal)])
			.then(([classrooms, gameVersions]) => {
				const availableClassrooms = classrooms.filter((classroom) => (classroom.status === 'active' || classroom.id === existingListing?.classroomId)
					&& (!institutionId || classroom.institution.id === institutionId));
				setClassroomList(availableClassrooms);
				setGameVersionList(gameVersions);
				setClassroomId((current) => availableClassrooms.some((classroom) => classroom.id === current)
					? current
					: availableClassrooms[0]?.id ?? '');
				setGameVersionId((current) => gameVersions.some((version) => version.id === current)
					? current
					: gameVersions.find((version) => version.id === initialGameVersionId)?.id ?? gameVersions[0]?.id ?? '');
			})
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Listing options could not be loaded.');
			})
			.finally(() => setLoading(false));

		return () => controller.abort();
	}, [existingListing?.classroomId, initialGameVersionId, institutionId]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
		event.preventDefault();
		setError(undefined);
		if (new Date(endAt).getTime() <= new Date(startAt).getTime()) {
			setError('Listing end date must be after its start date.');
			return;
		}

		setSaving(true);
		try {
			await onSubmit({
				classroomId,
				customizationId: customizationId.trim() || (existingListing ? null : undefined),
				designatedPayor,
				endAt: new Date(endAt).toISOString(),
				gameVersionId,
				includedLicenseQuantity: includedLicenseQuantity ? Number(includedLicenseQuantity) : existingListing ? null : undefined,
				licenseDurationDays: Number(licenseDurationDays),
				price: designatedPayor === 'student'
					? { currency: 'USD', minorUnitAmount: Math.round(Number(priceAmount) * 100) }
					: existingListing ? null : undefined,
				publishedAt: publishedAt ? new Date(publishedAt).toISOString() : existingListing ? null : undefined,
				startAt: new Date(startAt).toISOString(),
			});
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : 'Listing could not be saved.');
		} finally {
			setSaving(false);
		}
	}

	return (
		<form className="institution-form classroom-game-listing-form" onSubmit={handleSubmit}>
			<div className="institution-form-fields">
				<div className="game-listing-form-section-heading institution-form-description"><h3>Assignment</h3><p>Choose the classroom and game version this listing belongs to.</p></div>
				<label>Classroom<select disabled={isLoading} onChange={(event) => setClassroomId(event.target.value)} required value={classroomId}>
					<option disabled value="">Select a classroom</option>
					{classroomList.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.institution.name} · {classroom.name}</option>)}
				</select></label>
				<label>Game version<select disabled={isLoading} onChange={(event) => {
					setGameVersionId(event.target.value);
					setCustomizationId('');
				}} required value={gameVersionId}>
					<option disabled value="">Select a game version</option>
					{gameVersionList.map((version) => <option key={version.id} value={version.id}>{version.gameTitle} · Version {version.publisherVersion}</option>)}
				</select></label>
				<label>Game customization<select disabled={isLoading || !selectedGameVersion} onChange={(event) => setCustomizationId(event.target.value)} value={customizationId}>
					<option value="">Use default game configuration</option>
					{customizationId && selectedGameVersion && !selectedGameVersion.customizationList.some((customization) => customization.id === customizationId) && <option value={customizationId}>Current customization unavailable</option>}
					{selectedGameVersion?.customizationList.map((customization, index) => <option key={customization.id} value={customization.id}>{customizationOptionLabel(customization, index)}</option>)}
				</select><span>{selectedGameVersion?.customizationList.length ? 'Choose a saved configuration for this version, or use its default.' : 'No saved customizations are available for this version; the default will be used.'}</span></label>
				{selectedGameVersion && <div className="game-listing-version-reference institution-form-description">
					<span>Selected version</span>
					<Link to={`/games/${selectedGameVersion.gameId}#game-version-${selectedGameVersion.id}`}>
						{selectedGameVersion.gameTitle} · Version {selectedGameVersion.publisherVersion}<ExternalLink aria-hidden="true" size={14}/>
					</Link>
				</div>}
				<label>Classroom language<input readOnly value={classroomList.find((classroom) => classroom.id === classroomId)?.language ?? ''}/></label>
				<label>Course type<input readOnly value={classroomList.find((classroom) => classroom.id === classroomId)?.courseType ?? ''}/></label>
				<div className="game-listing-form-section-heading institution-form-description"><h3>Access terms</h3><p>Set who pays and how long the license lasts.</p></div>
				<label>Designated payor<select onChange={(event) => setDesignatedPayor(event.target.value as ClassroomGameListing['designatedPayor'])} value={designatedPayor}>
					<option value="student">Student</option>
					<option value="institution">Institution</option>
				</select></label>
				<label>Student price (USD)<input disabled={designatedPayor === 'institution'} min="0" onChange={(event) => setPriceAmount(event.target.value)} required={designatedPayor === 'student'} step="0.01" type="number" value={priceAmount}/><span>{designatedPayor === 'student' ? 'Charged to the learner through checkout.' : 'Institution-funded listings do not charge the learner.'}</span></label>
				<label>Included license quantity<input min="0" onChange={(event) => setIncludedLicenseQuantity(event.target.value)} step="1" type="number" value={includedLicenseQuantity}/><span>Informational only; this does not limit acquisitions.</span></label>
				<label>License duration (days)<input min="1" onChange={(event) => setLicenseDurationDays(event.target.value)} required step="1" type="number" value={licenseDurationDays}/></label>
				<div className="game-listing-form-section-heading institution-form-description"><h3>Availability</h3><p>Choose when this assignment opens and whether it is published.</p></div>
				<label>Starts<input onChange={(event) => setStartAt(event.target.value)} required type="datetime-local" value={startAt}/></label>
				<label>Ends<input min={startAt} onChange={(event) => setEndAt(event.target.value)} required type="datetime-local" value={endAt}/><span>Must be after the start date.</span></label>
				<label>Publish at<input onChange={(event) => setPublishedAt(event.target.value)} type="datetime-local" value={publishedAt}/><span>Leave blank to keep this listing in draft.</span></label>
			</div>
			{!isLoading && (classroomList.length === 0 || gameVersionList.length === 0) && <p className="game-empty-note">An active classroom and a game version are required.</p>}
			{error && <div className="institution-form-error" role="alert"><AlertCircle size={16}/>{error}</div>}
			<div className="institution-form-actions">
				<Button disabled={isSaving} onClick={onCancel} size="sm" type="button" variant="outline"><X size={14}/> Cancel</Button>
				<Button disabled={isLoading || isSaving || classroomList.length === 0 || gameVersionList.length === 0} size="sm" type="submit"><Check size={14}/>{isSaving ? 'Saving...' : existingListing ? 'Save listing' : 'Create listing'}</Button>
			</div>
		</form>
	);
}

function toLocalDateTimeInput(date: Date): string {
	const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
	return localDate.toISOString().slice(0, 16);
}

function ClassroomGameListingRow({ classroomGameListing }: { classroomGameListing: ClassroomGameListing }) {
	const state = listingState(classroomGameListing);
	return (
		<div className="institution-row classroom-row classroom-game-listing-row">
			<div className="institution-name-cell">
				<div className="institution-row-mark"><Gamepad2 size={17}/></div>
				<div><Link to={`/classroom-game-listings/${classroomGameListing.id}`}>{classroomGameListing.gameTitle}</Link><span>{classroomGameListing.publisher.name} · {classroomGameListing.language} · {classroomGameListing.courseType.replaceAll('-', ' ')}</span></div>
			</div>
			<Link className="listing-classroom" to={`/classrooms/${classroomGameListing.classroomId}`}>{classroomGameListing.classroomName}</Link>
			<Link className="listing-institution" to={`/institutions/${classroomGameListing.institution.id}`}>{classroomGameListing.institution.name}</Link>
			<span className={`listing-state state-${state}`}>{state}</span>
			<Link aria-label={`Open ${classroomGameListing.gameTitle} listing`} className="row-open" to={`/classroom-game-listings/${classroomGameListing.id}`}><ExternalLink size={15}/></Link>
		</div>
	);
}

export function ClassroomGameListingDetailPage() {
	const { id = '' } = useParams();
	const [classroomGameListing, setClassroomGameListing] = useState<ClassroomGameListing>();
	const [error, setError] = useState<string>();

	useEffect(() => {
		const controller = new AbortController();
		setClassroomGameListing(undefined);
		setError(undefined);
		getClassroomGameListing(id, controller.signal)
			.then(setClassroomGameListing)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Classroom game details could not be loaded.');
			});

		return () => controller.abort();
	}, [id]);

	return (
		<section className="page-content" aria-labelledby="page-title">
			<Link className="back-link" to="/classroom-game-listings"><ArrowLeft size={15}/> Classroom games</Link>
			{error && <div className="detail-error" role="alert"><AlertCircle size={18}/>{error}</div>}
			{!error && !classroomGameListing && <div className="detail-loading">Loading classroom game...</div>}
			{classroomGameListing && <ClassroomGameListingDetails classroomGameListing={classroomGameListing}/>}
		</section>
	);
}

function ClassroomGameListingDetails({ classroomGameListing: initialClassroomGameListing }: { classroomGameListing: ClassroomGameListing }) {
	const [classroomGameListing, setClassroomGameListing] = useState(initialClassroomGameListing);
	const state = listingState(classroomGameListing);
	const isPublished = Boolean(classroomGameListing.publishedAt && new Date(classroomGameListing.publishedAt).getTime() <= Date.now());
	const navigate = useNavigate();
	const [isEditing, setEditing] = useState(false);
	const [isReplacementOpen, setReplacementOpen] = useState(false);
	return (
		<>
			<div className="detail-heading">
				<div className="detail-mark"><Gamepad2 size={22}/></div>
				<div>
					<p className="eyebrow">Education / Classroom games</p>
					<h1 id="page-title">{classroomGameListing.gameTitle}</h1>
					<p className="page-description">{classroomGameListing.classroomName} · {classroomGameListing.institution.name}</p>
				</div>
				<span className={`listing-state state-${state}`}>{state}</span>
				{isPublished
					? <Button className="refresh-button" onClick={() => setReplacementOpen(!isReplacementOpen)} size="sm" type="button" variant={isReplacementOpen ? 'default' : 'outline'}>{isReplacementOpen ? <X size={14}/> : <Plus size={14}/>} {isReplacementOpen ? 'Cancel replacement' : 'Create replacement'}</Button>
					: <Button className="refresh-button" onClick={() => setEditing(!isEditing)} size="sm" type="button" variant={isEditing ? 'default' : 'outline'}>{isEditing ? <X size={14}/> : <Check size={14}/>} {isEditing ? 'Cancel edit' : 'Edit listing'}</Button>}
			</div>
			{isEditing && <ClassroomGameListingForm
				existingListing={classroomGameListing}
				initialClassroomId={classroomGameListing.classroomId}
				initialGameVersionId={classroomGameListing.gameVersionId}
				institutionId={classroomGameListing.institution.id}
				onCancel={() => setEditing(false)}
				onSubmit={async (input) => {
					setClassroomGameListing(await updateAdminClassroomGameListing(classroomGameListing.id, input));
					setEditing(false);
				}}
			/>}
			{isReplacementOpen && <ClassroomGameListingForm
				initialClassroomId={classroomGameListing.classroomId}
				initialGameVersionId={classroomGameListing.gameVersionId}
				institutionId={classroomGameListing.institution.id}
				onCancel={() => setReplacementOpen(false)}
				onSubmit={async (input) => {
					const replacement = await createAdminClassroomGameListing(toCreateClassroomGameListingInput(input));
					navigate(`/classroom-game-listings/${replacement.id}`);
				}}
			/>}
			<div className="detail-section">
				<h2>Listing profile</h2>
				<dl className="detail-grid">
					<div><dt>Institution</dt><dd><Link to={`/institutions/${classroomGameListing.institution.id}`}>{classroomGameListing.institution.name}<ExternalLink size={13}/></Link></dd></div>
					<div><dt>Classroom</dt><dd><Link to={`/classrooms/${classroomGameListing.classroomId}`}>{classroomGameListing.classroomName}<ExternalLink size={13}/></Link></dd></div>
					<div><dt>Listing publication</dt><dd>{formatDate(classroomGameListing.publishedAt)}</dd></div>
					<div><dt>Game publication</dt><dd>{formatDate(classroomGameListing.gamePublishedAt)}</dd></div>
					<div><dt>Starts</dt><dd>{formatDate(classroomGameListing.startAt)}</dd></div>
					<div><dt>Ends</dt><dd>{formatDate(classroomGameListing.endAt)}</dd></div>
					<div><dt>Publisher</dt><dd><Link to={`/publishers/${classroomGameListing.publisher.id}`}>{classroomGameListing.publisher.name}<ExternalLink aria-hidden="true" size={13}/></Link></dd></div>
				</dl>
			</div>
			<div className="detail-section">
				<h2>Listing terms</h2>
				<dl className="detail-grid">
					<div><dt>Designated payor</dt><dd>{classroomGameListing.designatedPayor}</dd></div>
					<div><dt>Student price</dt><dd>{formatPrice(classroomGameListing.price)}</dd></div>
					<div><dt>License duration</dt><dd>{classroomGameListing.licenseDurationDays} days</dd></div>
					<div><dt>Game version</dt><dd><Link to={`/games/${classroomGameListing.gameId}#game-version-${classroomGameListing.gameVersionId}`}>{classroomGameListing.gameTitle} · Version {classroomGameListing.publisherVersion}<ExternalLink aria-hidden="true" size={13}/></Link></dd></div>
					<div><dt>Customization</dt><dd>{classroomCustomizationLabel(classroomGameListing)}{classroomGameListing.customizationId && <> · <Link to={`/games/${classroomGameListing.gameId}#game-version-${classroomGameListing.gameVersionId}`}>View game version</Link></>}</dd></div>
					<div><dt>Language</dt><dd>{classroomGameListing.language}</dd></div>
					<div><dt>Course type</dt><dd>{classroomGameListing.courseType.replaceAll('-', ' ')}</dd></div>
				</dl>
			</div>
		</>
	);
}