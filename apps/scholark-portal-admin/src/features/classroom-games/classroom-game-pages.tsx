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
	type AdminGameOffer,
	type Classroom,
	type ClassroomGame,
	type ClassroomGameListResponse,
	createAdminClassroomGame,
	type CreateAdminClassroomGameInput,
	getAllAdminInstitutionGameOffers,
	getAllClassrooms,
	getClassroomGame,
	getClassroomGameList,
	updateAdminClassroomGame,
} from '../../lib/admin-api';

const pageSize = 10;
const dateTimeFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

function assignmentState(classroomGame: ClassroomGame): string {
	const now = Date.now();
	if (!classroomGame.publishedAt || new Date(classroomGame.publishedAt).getTime() > now) {
		return 'unpublished';
	}
	if (new Date(classroomGame.endAt).getTime() < now) {
		return 'expired';
	}
	if (new Date(classroomGame.startAt).getTime() > now) {
		return 'scheduled';
	}
	return 'active';
}

function formatDate(value?: string): string {
	return value ? dateTimeFormat.format(new Date(value)) : 'Not published';
}

function formatPrice(price: { currency: string; minorUnitAmount: number }): string {
	return new Intl.NumberFormat(undefined, {
		currency: price.currency,
		style: 'currency',
	}).format(price.minorUnitAmount / 100);
}

export function ClassroomGameListPage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const institutionId = searchParams.get('institutionId') ?? '';
	const classroomId = searchParams.get('classroomId') ?? '';
	const [search, setSearch] = useState('');
	const [offset, setOffset] = useState(0);
	const [reloadKey, setReloadKey] = useState(0);
	const [result, setResult] = useState<ClassroomGameListResponse>();
	const [isCreateOpen, setCreateOpen] = useState(false);
	const [error, setError] = useState<string>();
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(undefined);
		getClassroomGameList(search, offset, institutionId, classroomId, controller.signal)
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
					<h1 id="page-title">Classroom games</h1>
					<p className="page-description">Review game assignments, availability windows, and institutional offers.</p>
				</div>
				<div className="institution-heading-actions">
					<Button onClick={() => setCreateOpen(!isCreateOpen)} size="sm" type="button" variant={isCreateOpen ? 'outline' : 'default'}>{isCreateOpen ? <X size={14}/> : <Plus size={14}/>} {isCreateOpen ? 'Cancel' : 'Add assignment'}</Button>
					<Button className="refresh-button" onClick={() => setReloadKey(reloadKey + 1)} size="sm" type="button" variant="outline"><RefreshCw size={15}/> Refresh</Button>
				</div>
			</div>
			{isCreateOpen && <ClassroomGameForm
				initialClassroomId={classroomId}
				institutionId={institutionId}
				onCancel={() => setCreateOpen(false)}
				onSubmit={async (input) => {
					const assignment = await createAdminClassroomGame({ ...input, publishedAt: input.publishedAt ?? undefined });
					setCreateOpen(false);
					navigate(`/classroom-games/${assignment.id}`);
				}}
			/>}
			{institutionId && <p className="filter-context">Filtered by institution <Link to={`/institutions/${institutionId}`}>view institution <ExternalLink size={13}/></Link></p>}
			{classroomId && <p className="filter-context">Filtered by classroom <Link to={`/classrooms/${classroomId}`}>view classroom <ExternalLink size={13}/></Link></p>}
			<div className="table-toolbar">
				<label className="search-field">
					<Search aria-hidden="true" size={17}/>
					<input aria-label="Search classroom games" onChange={(event) => {
						setSearch(event.target.value);
						setOffset(0);
					}} placeholder="Search games, classrooms" value={search}/>
				</label>
			</div>
			<div className="table-frame">
				<div className="institution-table-header classroom-game-table-header">
					<span>Game</span><span>Classroom</span><span>Institution</span><span>Assignment</span><span/>
				</div>
				{error && <div className="inline-error" role="alert"><AlertCircle size={17}/><span>{error}</span><Button onClick={() => setReloadKey(reloadKey + 1)} size="sm" variant="outline">Try again</Button></div>}
				{isLoading && <div aria-label="Loading classroom games" className="table-loading"><span/><span/><span/><span/></div>}
				{!isLoading && !error && result?.classroomGameList.length === 0 && <div className="empty-state"><div className="empty-mark"><Gamepad2 size={20}/></div><strong>No classroom games found</strong><p>Try a different search or institution.</p></div>}
				{!isLoading && !error && result && result.classroomGameList.length > 0 && <div className="institution-rows">{result.classroomGameList.map((classroomGame) => <ClassroomGameRow classroomGame={classroomGame} key={classroomGame.id}/>)}</div>}
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

function ClassroomGameForm({
	assignment,
	initialClassroomId,
	initialOfferId,
	institutionId,
	onCancel,
	onSubmit,
}: {
	assignment?: ClassroomGame;
	initialClassroomId: string;
	initialOfferId?: string;
	institutionId: string;
	onCancel: () => void;
	onSubmit: (input: Omit<CreateAdminClassroomGameInput, 'publishedAt'> & { publishedAt?: string | null }) => Promise<void>;
}) {
	const [classroomList, setClassroomList] = useState<Classroom[]>([]);
	const [offerList, setOfferList] = useState<AdminGameOffer[]>([]);
	const [classroomId, setClassroomId] = useState(initialClassroomId);
	const [offerId, setOfferId] = useState(initialOfferId ?? '');
	const [startAt, setStartAt] = useState(() => toLocalDateTimeInput(assignment ? new Date(assignment.startAt) : new Date()));
	const [endAt, setEndAt] = useState(() => {
		const date = assignment ? new Date(assignment.endAt) : new Date();
		if (!assignment) {
			date.setDate(date.getDate() + 90);
		}
		return toLocalDateTimeInput(date);
	});
	const [publishedAt, setPublishedAt] = useState(() => assignment?.publishedAt ? toLocalDateTimeInput(new Date(assignment.publishedAt)) : '');
	const [error, setError] = useState<string>();
	const [isLoading, setLoading] = useState(true);
	const [isSaving, setSaving] = useState(false);

	useEffect(() => {
		const controller = new AbortController();
		Promise.all([getAllClassrooms(controller.signal), getAllAdminInstitutionGameOffers(controller.signal)])
			.then(([classrooms, offers]) => {
				const availableClassrooms = classrooms.filter((classroom) => classroom.status === 'active'
					&& (!institutionId || classroom.institution.id === institutionId));
				const availableOffers = offers.filter((offer) => offer.offerType === 'institution');
				setClassroomList(availableClassrooms);
				setOfferList(availableOffers);
				setClassroomId((current) => availableClassrooms.some((classroom) => classroom.id === current)
					? current
					: availableClassrooms[0]?.id ?? '');
				setOfferId((current) => availableOffers.some((offer) => offer.id === current)
					? current
					: availableOffers[0]?.id ?? '');
			})
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Assignment options could not be loaded.');
			})
			.finally(() => setLoading(false));

		return () => controller.abort();
	}, [institutionId]);

	const selectedOffer = offerList.find((offer) => offer.id === offerId);

	async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
		event.preventDefault();
		setError(undefined);
		if (new Date(endAt).getTime() <= new Date(startAt).getTime()) {
			setError('Assignment end date must be after its start date.');
			return;
		}

		setSaving(true);
		try {
			await onSubmit({
				classroomId,
				endAt: new Date(endAt).toISOString(),
				institutionGameOfferId: offerId,
				publishedAt: publishedAt ? new Date(publishedAt).toISOString() : assignment ? null : undefined,
				startAt: new Date(startAt).toISOString(),
			});
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : 'Assignment could not be created.');
		} finally {
			setSaving(false);
		}
	}

	return (
		<form className="institution-form classroom-game-form" onSubmit={handleSubmit}>
			<div className="institution-form-fields">
				<label>Classroom<select disabled={isLoading} onChange={(event) => setClassroomId(event.target.value)} required value={classroomId}>
					<option disabled value="">Select a classroom</option>
					{classroomList.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.institution.name} · {classroom.name}</option>)}
				</select></label>
				<label>Institution offer<select disabled={isLoading} onChange={(event) => setOfferId(event.target.value)} required value={offerId}>
					<option disabled value="">Select an offer</option>
					{offerList.map((offer) => <option key={offer.id} value={offer.id}>{offer.game.title} · {offer.gameVersion.publisherVersion} · {offer.gameVariant.language} · {offer.designatedPayor}</option>)}
				</select></label>
				<label>Starts<input onChange={(event) => setStartAt(event.target.value)} required type="datetime-local" value={startAt}/></label>
				<label>Ends<input min={startAt} onChange={(event) => setEndAt(event.target.value)} required type="datetime-local" value={endAt}/></label>
				<label>Publish at<input onChange={(event) => setPublishedAt(event.target.value)} type="datetime-local" value={publishedAt}/></label>
			</div>
			{selectedOffer && <p className="game-assignment-offer-summary">{selectedOffer.designatedPayor} pays · {selectedOffer.licenseDurationDays} day license · {formatPrice(selectedOffer.price)}</p>}
			{!isLoading && (classroomList.length === 0 || offerList.length === 0) && <p className="game-empty-note">A classroom and institution offer are required.</p>}
			{error && <div className="institution-form-error" role="alert"><AlertCircle size={16}/>{error}</div>}
			<div className="institution-form-actions">
				<Button disabled={isSaving} onClick={onCancel} size="sm" type="button" variant="outline"><X size={14}/> Cancel</Button>
				<Button disabled={isLoading || isSaving || classroomList.length === 0 || offerList.length === 0} size="sm" type="submit"><Check size={14}/>{isSaving ? 'Saving...' : assignment ? 'Save changes' : 'Create assignment'}</Button>
			</div>
		</form>
	);
}

function toLocalDateTimeInput(date: Date): string {
	const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
	return localDate.toISOString().slice(0, 16);
}

function ClassroomGameRow({ classroomGame }: { classroomGame: ClassroomGame }) {
	const state = assignmentState(classroomGame);
	return (
		<div className="institution-row classroom-row classroom-game-row">
			<div className="institution-name-cell">
				<div className="institution-row-mark"><Gamepad2 size={17}/></div>
				<div><Link to={`/classroom-games/${classroomGame.id}`}>{classroomGame.gameTitle}</Link><span>{classroomGame.publisher.name} · {classroomGame.language} · {classroomGame.mode}</span></div>
			</div>
			<Link className="game-assignment-classroom" to={`/classrooms/${classroomGame.classroomId}`}>{classroomGame.classroomName}</Link>
			<Link className="game-assignment-institution" to={`/institutions/${classroomGame.institution.id}`}>{classroomGame.institution.name}</Link>
			<span className={`assignment-state state-${state}`}>{state}</span>
			<Link aria-label={`Open ${classroomGame.gameTitle} assignment`} className="row-open" to={`/classroom-games/${classroomGame.id}`}><ExternalLink size={15}/></Link>
		</div>
	);
}

export function ClassroomGameDetailPage() {
	const { id = '' } = useParams();
	const [classroomGame, setClassroomGame] = useState<ClassroomGame>();
	const [error, setError] = useState<string>();

	useEffect(() => {
		const controller = new AbortController();
		setClassroomGame(undefined);
		setError(undefined);
		getClassroomGame(id, controller.signal)
			.then(setClassroomGame)
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
			<Link className="back-link" to="/classroom-games"><ArrowLeft size={15}/> Classroom games</Link>
			{error && <div className="detail-error" role="alert"><AlertCircle size={18}/>{error}</div>}
			{!error && !classroomGame && <div className="detail-loading">Loading classroom game...</div>}
			{classroomGame && <ClassroomGameDetails classroomGame={classroomGame}/>}
		</section>
	);
}

function ClassroomGameDetails({ classroomGame: initialClassroomGame }: { classroomGame: ClassroomGame }) {
	const [classroomGame, setClassroomGame] = useState(initialClassroomGame);
	const state = assignmentState(classroomGame);
	const isPublished = Boolean(classroomGame.publishedAt && new Date(classroomGame.publishedAt).getTime() <= Date.now());
	const navigate = useNavigate();
	const [isEditing, setEditing] = useState(false);
	const [isReplacementOpen, setReplacementOpen] = useState(false);
	return (
		<>
			<div className="detail-heading">
				<div className="detail-mark"><Gamepad2 size={22}/></div>
				<div>
					<p className="eyebrow">Education / Classroom games</p>
					<h1 id="page-title">{classroomGame.gameTitle}</h1>
					<p className="page-description">{classroomGame.classroomName} · {classroomGame.institution.name}</p>
				</div>
				<span className={`assignment-state state-${state}`}>{state}</span>
				{isPublished
					? <Button className="refresh-button" onClick={() => setReplacementOpen(!isReplacementOpen)} size="sm" type="button" variant={isReplacementOpen ? 'default' : 'outline'}>{isReplacementOpen ? <X size={14}/> : <Plus size={14}/>} {isReplacementOpen ? 'Cancel replacement' : 'Create replacement'}</Button>
					: <Button className="refresh-button" onClick={() => setEditing(!isEditing)} size="sm" type="button" variant={isEditing ? 'default' : 'outline'}>{isEditing ? <X size={14}/> : <Check size={14}/>} {isEditing ? 'Cancel edit' : 'Edit assignment'}</Button>}
			</div>
			{isEditing && <ClassroomGameForm
				assignment={classroomGame}
				initialClassroomId={classroomGame.classroomId}
				initialOfferId={classroomGame.institutionGameOfferId}
				institutionId={classroomGame.institution.id}
				onCancel={() => setEditing(false)}
				onSubmit={async (input) => {
					setClassroomGame(await updateAdminClassroomGame(classroomGame.id, input));
					setEditing(false);
				}}
			/>}
			{isReplacementOpen && <ClassroomGameForm
				initialClassroomId={classroomGame.classroomId}
				initialOfferId={classroomGame.institutionGameOfferId}
				institutionId={classroomGame.institution.id}
				onCancel={() => setReplacementOpen(false)}
				onSubmit={async (input) => {
					const replacement = await createAdminClassroomGame({ ...input, publishedAt: input.publishedAt ?? undefined });
					navigate(`/classroom-games/${replacement.id}`);
				}}
			/>}
			<div className="detail-section">
				<h2>Assignment profile</h2>
				<dl className="detail-grid">
					<div><dt>Institution</dt><dd><Link to={`/institutions/${classroomGame.institution.id}`}>{classroomGame.institution.name}<ExternalLink size={13}/></Link></dd></div>
					<div><dt>Classroom</dt><dd><Link to={`/classrooms/${classroomGame.classroomId}`}>{classroomGame.classroomName}<ExternalLink size={13}/></Link></dd></div>
					<div><dt>Assignment publication</dt><dd>{formatDate(classroomGame.publishedAt)}</dd></div>
					<div><dt>Game publication</dt><dd>{formatDate(classroomGame.gamePublishedAt)}</dd></div>
					<div><dt>Starts</dt><dd>{formatDate(classroomGame.startAt)}</dd></div>
					<div><dt>Ends</dt><dd>{formatDate(classroomGame.endAt)}</dd></div>
					<div><dt>Game slug</dt><dd>{classroomGame.gameSlug}</dd></div>
					<div><dt>Publisher</dt><dd>{classroomGame.publisher.name}</dd></div>
				</dl>
			</div>
			<div className="detail-section">
				<h2>Institution offer</h2>
				<dl className="detail-grid">
					<div><dt>Designated payor</dt><dd>{classroomGame.designatedPayor}</dd></div>
					<div><dt>Offer price</dt><dd>{formatPrice(classroomGame.price)}</dd></div>
					<div><dt>License duration</dt><dd>{classroomGame.licenseDurationDays} days</dd></div>
					<div><dt>Game version</dt><dd>{classroomGame.gameVersionId}</dd></div>
					<div><dt>Language</dt><dd>{classroomGame.language}</dd></div>
					<div><dt>Mode</dt><dd>{classroomGame.mode}</dd></div>
					<div><dt>Offer ID</dt><dd>{classroomGame.institutionGameOfferId}</dd></div>
				</dl>
			</div>
		</>
	);
}