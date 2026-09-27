import { Button } from '@repo/ui/button';
import {
	AlertCircle,
	ArrowLeft,
	Check,
	ChevronLeft,
	ChevronRight,
	Copy,
	Plus,
	RefreshCw,
	Search,
	TicketCheck,
	X,
} from 'lucide-react';
import {
	type FormEvent,
	useEffect,
	useState
} from 'react';
import { Link, useParams } from 'react-router-dom';

import {
	type AdminAcquisitionCode,
	type ClassroomGame,
	createAdminAcquisitionCodes,
	getAdminAcquisitionCode,
	getAdminAcquisitionCodeList,
	getAllAdminClassroomGames,
	getAllInstitutions,
	type Institution,
	revokeAdminAcquisitionCode,
} from '../../lib/admin-api';

const pageSize = 10;
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

function formatDate(value?: string): string {
	return value ? dateFormat.format(new Date(value)) : 'Unknown';
}

function formatPrice(price?: { currency: string; minorUnitAmount: number }): string {
	if (!price) {
		return 'Unavailable';
	}

	return new Intl.NumberFormat(undefined, {
		currency: price.currency,
		style: 'currency',
	}).format(price.minorUnitAmount / 100);
}

function getDefaultExpiryDate(): string {
	const date = new Date();
	date.setFullYear(date.getFullYear() + 1);
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function AcquisitionCodeListPage() {
	const [isCreateOpen, setCreateOpen] = useState(false);
	const [classroomGameList, setClassroomGameList] = useState<ClassroomGame[]>([]);
	const [institutionList, setInstitutionList] = useState<Institution[]>([]);
	const [isLoadingOptions, setLoadingOptions] = useState(true);
	const [optionError, setOptionError] = useState<string>();
	const [classroomGameId, setClassroomGameId] = useState('');
	const [quantity, setQuantity] = useState('10');
	const [expiresAt, setExpiresAt] = useState(getDefaultExpiryDate);
	const [isSaving, setSaving] = useState(false);
	const [createError, setCreateError] = useState<string>();
	const [generatedCodeList, setGeneratedCodeList] = useState<string[]>([]);
	const [isCopied, setCopied] = useState(false);
	const [search, setSearch] = useState('');
	const [institutionFilter, setInstitutionFilter] = useState('');
	const [offset, setOffset] = useState(0);
	const [reloadKey, setReloadKey] = useState(0);
	const [result, setResult] = useState<{ acquisitionCodeList: AdminAcquisitionCode[]; totalItemCount: number }>();
	const [error, setError] = useState<string>();
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		const controller = new AbortController();
		setLoadingOptions(true);
		Promise.all([getAllAdminClassroomGames(controller.signal), getAllInstitutions(controller.signal)])
			.then(([classroomGames, institutions]) => {
				setClassroomGameList(classroomGames.filter((classroomGame) => classroomGame.designatedPayor === 'institution'));
				setInstitutionList(institutions);
			})
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setOptionError(requestError instanceof Error ? requestError.message : 'Classroom games could not be loaded.');
			})
			.finally(() => setLoadingOptions(false));

		return () => controller.abort();
	}, []);

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(undefined);
		getAdminAcquisitionCodeList(search, offset, institutionFilter, controller.signal)
			.then(setResult)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Acquisition codes could not be loaded.');
			})
			.finally(() => setLoading(false));

		return () => controller.abort();
	}, [institutionFilter, offset, reloadKey, search]);

	const totalItemCount = result?.totalItemCount ?? 0;
	const firstItem = totalItemCount === 0 ? 0 : offset + 1;
	const lastItem = Math.min(offset + pageSize, totalItemCount);

	async function handleCreate(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSaving(true);
		setCreateError(undefined);
		setCopied(false);
		try {
			const expiry = new Date(`${expiresAt}T23:59:59.999`);
			const response = await createAdminAcquisitionCodes({
				classroomGameId,
				expiresAt: expiry.toISOString(),
				quantity: Number(quantity),
			});
			setGeneratedCodeList(response.codeList);
			setCreateOpen(false);
			setOffset(0);
			setReloadKey((key) => key + 1);
		} catch (requestError: unknown) {
			setCreateError(requestError instanceof Error ? requestError.message : 'Acquisition codes could not be created.');
		} finally {
			setSaving(false);
		}
	}

	async function copyGeneratedCodes() {
		try {
			await navigator.clipboard.writeText(generatedCodeList.join('\n'));
			setCopied(true);
		} catch {
			setCreateError('Codes could not be copied. Select and copy them directly.');
		}
	}

	return (
		<section className="page-content" aria-labelledby="page-title">
			<div className="page-heading">
				<div>
					<p className="eyebrow">Education</p>
					<h1 id="page-title">Acquisition codes</h1>
					<p className="page-description">Generate institution-funded access codes and review their redemptions.</p>
				</div>
				<div className="institution-heading-actions">
					<Button className="refresh-button" onClick={() => setCreateOpen((open) => !open)} size="sm" type="button" variant={isCreateOpen ? 'outline' : 'default'}>
						{isCreateOpen ? <X size={15}/> : <Plus size={15}/>} {isCreateOpen ? 'Cancel' : 'Generate codes'}
					</Button>
					<Button className="refresh-button" onClick={() => setReloadKey((key) => key + 1)} size="sm" type="button" variant="outline">
						<RefreshCw size={15}/> Refresh
					</Button>
				</div>
			</div>
			{isCreateOpen && <form className="institution-form acquisition-code-form" onSubmit={handleCreate}>
				<div className="institution-form-fields">
					<label>Classroom game<select disabled={isLoadingOptions || classroomGameList.length === 0} onChange={(event) => setClassroomGameId(event.target.value)} required value={classroomGameId}>
						<option disabled value="">{isLoadingOptions ? 'Loading classroom games...' : 'Select an assignment'}</option>
						{classroomGameList.map((classroomGame) => <option key={classroomGame.id} value={classroomGame.id}>{classroomGame.institution.name} · {classroomGame.classroomName} · {classroomGame.gameTitle} · Version {classroomGame.publisherVersion} · {classroomGame.language}</option>)}
					</select></label>
					<label>Number of codes<input max={500} min={1} onChange={(event) => setQuantity(event.target.value)} required type="number" value={quantity}/></label>
					<label>Valid through<input min={getDefaultExpiryDate()} onChange={(event) => setExpiresAt(event.target.value)} required type="date" value={expiresAt}/></label>
				</div>
				{optionError && <div className="institution-form-error" role="alert"><AlertCircle size={16}/>{optionError}</div>}
				{!isLoadingOptions && !optionError && classroomGameList.length === 0 && <p className="game-empty-note">Create an institution-funded classroom game assignment before generating codes.</p>}
				{createError && <div className="institution-form-error" role="alert"><AlertCircle size={16}/>{createError}</div>}
				<div className="institution-form-actions">
					<Button disabled={isSaving || isLoadingOptions || classroomGameList.length === 0} size="sm" type="submit"><TicketCheck size={14}/>{isSaving ? 'Generating...' : 'Generate codes'}</Button>
				</div>
			</form>}
			{generatedCodeList.length > 0 && <section aria-label="Generated acquisition codes" className="detail-section acquisition-generated-panel">
				<div className="acquisition-generated-heading"><div><h2>{generatedCodeList.length} codes generated</h2><p>Copy these codes now and share them with eligible users.</p></div><Button onClick={copyGeneratedCodes} size="sm" type="button" variant="outline">{isCopied ? <Check size={14}/> : <Copy size={14}/>} {isCopied ? 'Copied' : 'Copy codes'}</Button></div>
				<ul>{generatedCodeList.map((code) => <li key={code}><code>{code}</code></li>)}</ul>
			</section>}
			<div className="table-toolbar">
				<label className="search-field">
					<Search aria-hidden="true" size={17}/>
					<input aria-label="Search acquisition codes" onChange={(event) => {
						setSearch(event.target.value);
						setOffset(0);
					}} placeholder="Search codes or games" value={search}/>
				</label>
				<label className="status-filter"><span>Institution</span><select aria-label="Filter acquisition codes by institution" onChange={(event) => {
					setInstitutionFilter(event.target.value);
					setOffset(0);
				}} value={institutionFilter}>
					<option value="">All institutions</option>
					{institutionList.map((institution) => <option key={institution.id} value={institution.id}>{institution.name}</option>)}
				</select></label>
			</div>
			<div className="table-frame acquisition-code-table-frame">
				<div className="institution-table-header billing-table-header acquisition-code-table-header"><span>Code</span><span>Classroom / institution</span><span>Game</span><span>Status and terms</span><span>Issued / acquired</span></div>
				{error && <div className="inline-error" role="alert"><AlertCircle size={17}/><span>{error}</span><Button onClick={() => setReloadKey((key) => key + 1)} size="sm" variant="outline">Try again</Button></div>}
				{isLoading && <div aria-label="Loading acquisition codes" className="table-loading"><span/><span/><span/><span/></div>}
				{!isLoading && !error && result?.acquisitionCodeList.length === 0 && <div className="empty-state"><div className="empty-mark"><TicketCheck size={20}/></div><strong>No acquisition codes found</strong><p>Generate a code batch or adjust your search.</p></div>}
				{!isLoading && !error && result && result.acquisitionCodeList.length > 0 && <div className="institution-rows">{result.acquisitionCodeList.map((code) => <AcquisitionCodeRow code={code} key={code.id}/>)}</div>}
			</div>
			<div className="table-pagination">
				<span>{totalItemCount === 0 ? 'No codes' : `Showing ${firstItem}–${lastItem} of ${totalItemCount}`}</span>
				<div>
					<Button aria-label="Previous page" disabled={offset === 0 || isLoading} onClick={() => setOffset(Math.max(0, offset - pageSize))} size="icon" variant="outline"><ChevronLeft size={16}/></Button>
					<Button aria-label="Next page" disabled={offset + pageSize >= totalItemCount || isLoading} onClick={() => setOffset(offset + pageSize)} size="icon" variant="outline"><ChevronRight size={16}/></Button>
				</div>
			</div>
		</section>
	);
}

function AcquisitionCodeRow({ code }: { code: AdminAcquisitionCode }) {
	const gameVersion = [code.publisherVersion && `Version ${code.publisherVersion}`, code.language, code.mode?.replaceAll('_', ' ')].filter(Boolean).join(' · ');
	const terms = code.designatedPayor
		? `${code.designatedPayor} pays · ${code.licenseDurationDays ?? 'Unknown'} days · ${formatPrice(code.price)}`
		: 'Legacy code · terms unavailable';

	return (
		<div className="institution-row billing-row billing-code-row acquisition-code-row">
			<div className="institution-name-cell billing-user"><div><strong><Link className="acquisition-code-link" to={`/acquisition-codes/${code.id}`}>{code.code}</Link></strong><span>Expires {formatDate(code.expiresAt)}</span></div></div>
			<div className="acquisition-code-classroom"><strong>{code.classroomName ?? 'Unassigned classroom'}</strong><small>{code.institutionName ?? 'Institution unavailable'}</small></div>
			<strong className="billing-game">{code.gameTitle ?? 'Classroom game unavailable'}{gameVersion && <small>{gameVersion}</small>}</strong>
			<div className="billing-detail"><span className={`billing-state billing-state-${code.status}`}>{code.status}</span><small>{terms}</small></div>
			<div className="billing-created">
				<time dateTime={code.createdAt}>Issued {formatDate(code.createdAt)}</time>
				<span>{code.redemptionList.length} {code.redemptionList.length === 1 ? 'user acquired' : 'users acquired'}</span>
			</div>
		</div>
	);
}

export function AcquisitionCodeDetailPage() {
	const { id = '' } = useParams();
	const [code, setCode] = useState<AdminAcquisitionCode>();
	const [error, setError] = useState<string>();
	const [revokeReason, setRevokeReason] = useState('');
	const [revokeError, setRevokeError] = useState<string>();
	const [isRevoking, setRevoking] = useState(false);

	useEffect(() => {
		const controller = new AbortController();
		setCode(undefined);
		setError(undefined);
		getAdminAcquisitionCode(id, controller.signal)
			.then(setCode)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Acquisition code could not be loaded.');
			});

		return () => controller.abort();
	}, [id]);

	async function handleRevoke(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setRevoking(true);
		setRevokeError(undefined);
		try {
			await revokeAdminAcquisitionCode(id, revokeReason);
			setCode((current) => current ? { ...current, revokedAt: new Date().toISOString(), status: 'revoked' } : current);
			setRevokeReason('');
		} catch (requestError: unknown) {
			setRevokeError(requestError instanceof Error ? requestError.message : 'Acquisition code could not be revoked.');
		} finally {
			setRevoking(false);
		}
	}

	return (
		<section className="page-content" aria-labelledby="page-title">
			<Link className="back-link" to="/acquisition-codes"><ArrowLeft size={15}/> Acquisition codes</Link>
			{error && <div className="detail-error" role="alert"><AlertCircle size={18}/>{error}</div>}
			{!error && !code && <div className="detail-loading">Loading acquisition code...</div>}
			{code && <>
				<div className="detail-heading">
					<div className="detail-mark"><TicketCheck size={22}/></div>
					<div>
						<p className="eyebrow">Education / Acquisition codes</p>
						<h1 id="page-title">{code.code}</h1>
						<p className="page-description">{code.gameTitle ?? 'Legacy acquisition code'}{code.publisherVersion ? ` · Version ${code.publisherVersion}` : ''}{code.language ? ` · ${code.language}` : ''}{code.mode ? ` · ${code.mode.replaceAll('_', ' ')}` : ''}</p>
					</div>
					<span className={`billing-state billing-state-${code.status}`}>{code.status}</span>
				</div>
				<section className="detail-section">
					<h2>Code details</h2>
					<dl className="detail-grid">
						<div><dt>Institution</dt><dd>{code.institutionId && code.institutionName ? <Link to={`/institutions/${code.institutionId}`}>{code.institutionName}</Link> : 'Unavailable for legacy code'}</dd></div>
						<div><dt>Classroom</dt><dd>{code.classroomId && code.classroomName ? <Link to={`/classrooms/${code.classroomId}`}>{code.classroomName}</Link> : 'Unavailable for legacy code'}</dd></div>
						<div><dt>Game</dt><dd>{code.gameTitle ?? 'Unavailable'}</dd></div>
						<div><dt>Code status</dt><dd>{code.status}</dd></div>
						<div><dt>Issued</dt><dd>{formatDate(code.createdAt)}</dd></div>
						<div><dt>Valid through</dt><dd>{formatDate(code.expiresAt)}</dd></div>
						<div><dt>License duration</dt><dd>{code.licenseDurationDays} days</dd></div>
						<div><dt>Offer price</dt><dd>{formatPrice(code.price)}</dd></div>
					</dl>
				</section>
				{code.status === 'active' && <section className="detail-section acquisition-code-revoke-section">
					<h2>Revoke code</h2>
					<p>Future redemptions will be blocked. Licenses already issued remain active.</p>
					<form className="acquisition-code-revoke-form" onSubmit={handleRevoke}>
						<label htmlFor="revoke-reason">Reason</label>
						<textarea id="revoke-reason" maxLength={1000} onChange={(event) => setRevokeReason(event.target.value)} required rows={3} value={revokeReason}/>
						{revokeError && <div className="institution-form-error" role="alert"><AlertCircle size={16}/>{revokeError}</div>}
						<Button disabled={isRevoking || !revokeReason.trim()} size="sm" type="submit" variant="outline">{isRevoking ? 'Revoking...' : 'Revoke code'}</Button>
					</form>
				</section>}
				<section className="detail-section">
					<h2>Users who acquired this code ({code.redemptionList.length})</h2>
					{code.redemptionList.length > 0
						? <ul className="related-record-list acquisition-code-redemption-list">{code.redemptionList.map((redemption) => <li key={redemption.id}><div><strong>{redemption.userName}</strong><small>{redemption.userEmail}</small></div><time dateTime={redemption.redeemedAt}>{formatDate(redemption.redeemedAt)}</time></li>)}</ul>
						: <p>No users have acquired access with this code.</p>}
				</section>
				<section className="detail-section">
					<h2>Code activity</h2>
					{code.eventList.length > 0 ? <ol className="acquisition-event-list">{code.eventList.map((event) => <li key={event.id}>
						<div className="acquisition-event-heading"><strong>{event.eventType.replaceAll('_', ' ')}</strong><time dateTime={event.createdAt}>{formatDate(event.createdAt)}</time></div>
						<p>{event.actorName ?? event.actorType}{event.reason ? ` · ${event.reason}` : ''}</p>
					</li>)}</ol> : <p>No code events recorded.</p>}
				</section>
			</>}
		</section>
	);
}