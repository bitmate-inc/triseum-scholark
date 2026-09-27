import { Button } from '@repo/ui/button';
import {
	AlertCircle,
	ChevronLeft,
	ChevronRight,
	CreditCard,
	KeyRound,
	RefreshCw,
	Search,
	ShoppingBag,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
	type AdminBillingAcquisition,
	type AdminBillingAcquisitionDetail,
	type AdminBillingLicense,
	type AdminBillingPaymentAttempt,
	getAdminAcquisition,
	getAdminAcquisitionList,
	getAdminLicenseList,
	getAdminPaymentAttemptList,
} from '../../lib/admin-api';

const pageSize = 10;
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
const recordTypeList = [
	{ label: 'Acquisitions', value: 'acquisitions', icon: ShoppingBag },
	{ label: 'Payment attempts', value: 'payment-attempts', icon: CreditCard },
	{ label: 'Licenses', value: 'licenses', icon: KeyRound },
] as const;

type BillingRecordType = typeof recordTypeList[number]['value'];
type BillingRecord = {
	createdAt?: string;
	detail: string;
	gameTitle: string;
	id: string;
	status: string;
	userEmail: string;
	userName: string;
	detailPath?: string;
};

function formatPrice(price: { currency: string; minorUnitAmount: number }): string {
	return new Intl.NumberFormat(undefined, {
		currency: price.currency,
		style: 'currency',
	}).format(price.minorUnitAmount / 100);
}

function formatDate(value?: string): string {
	return value ? dateFormat.format(new Date(value)) : 'Unknown';
}

function acquisitionRows(acquisitionList: AdminBillingAcquisition[]): BillingRecord[] {
	return acquisitionList.map((acquisition) => ({
		createdAt: acquisition.createdAt,
		detail: acquisition.mechanism === 'complimentary'
			? `List price ${formatPrice(acquisition.price)}`
			: formatPrice(acquisition.price),
		gameTitle: acquisition.gameTitle,
		id: acquisition.id,
		detailPath: `/billing/acquisitions/${acquisition.id}`,
		status: acquisition.mechanism,
		userEmail: acquisition.userEmail,
		userName: acquisition.userName,
	}));
}

function paymentAttemptRows(paymentAttemptList: AdminBillingPaymentAttempt[]): BillingRecord[] {
	return paymentAttemptList.map((attempt) => ({
		createdAt: attempt.createdAt,
		detail: `${formatPrice(attempt.price)} · ${attempt.licenseDurationDays} days`,
		gameTitle: attempt.gameTitle,
		id: attempt.id,
		status: attempt.status,
		userEmail: attempt.userEmail,
		userName: attempt.userName,
	}));
}

function licenseRows(licenseList: AdminBillingLicense[]): BillingRecord[] {
	return licenseList.map((license) => ({
		createdAt: license.createdAt,
		detail: `${formatDate(license.startAt)} – ${formatDate(license.endAt)}`,
		gameTitle: license.gameTitle,
		id: license.id,
		status: license.status,
		userEmail: license.userEmail,
		userName: license.userName,
	}));
}

export function BillingListPage() {
	const [recordType, setRecordType] = useState<BillingRecordType>('acquisitions');
	const [search, setSearch] = useState('');
	const [filter, setFilter] = useState('');
	const [offset, setOffset] = useState(0);
	const [reloadKey, setReloadKey] = useState(0);
	const [result, setResult] = useState<{ itemList: BillingRecord[]; totalItemCount: number }>();
	const [error, setError] = useState<string>();
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(undefined);
		const loadRecords = async () => {
			try {
				if (recordType === 'acquisitions') {
					const response = await getAdminAcquisitionList(search, offset, filter, controller.signal);
					setResult({ itemList: acquisitionRows(response.acquisitionList), totalItemCount: response.totalItemCount });
				} else if (recordType === 'payment-attempts') {
					const response = await getAdminPaymentAttemptList(search, offset, filter, controller.signal);
					setResult({ itemList: paymentAttemptRows(response.paymentAttemptList), totalItemCount: response.totalItemCount });
				} else {
					const response = await getAdminLicenseList(search, offset, filter, controller.signal);
					setResult({ itemList: licenseRows(response.licenseList), totalItemCount: response.totalItemCount });
				}
			} catch (requestError: unknown) {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Billing records could not be loaded.');
			} finally {
				setLoading(false);
			}
		};
		void loadRecords();

		return () => controller.abort();
	}, [filter, offset, recordType, reloadKey, search]);

	const totalItemCount = result?.totalItemCount ?? 0;
	const firstItem = totalItemCount === 0 ? 0 : offset + 1;
	const lastItem = Math.min(offset + pageSize, totalItemCount);
	const filterOptionList = recordType === 'acquisitions'
		? [['user_paid', 'User paid'], ['institution_funded', 'Institution funded'], ['complimentary', 'Complimentary']]
		: recordType === 'payment-attempts'
			? [['pending', 'Pending'], ['fulfilled', 'Fulfilled'], ['failed', 'Failed']]
			: [['active', 'Active'], ['scheduled', 'Scheduled'], ['expired', 'Expired']];

	return (
		<section className="page-content" aria-labelledby="page-title">
			<div className="page-heading">
				<div>
					<p className="eyebrow">Platform</p>
					<h1 id="page-title">Billing & acquisitions</h1>
					<p className="page-description">Review purchases, payment outcomes, and issued game licenses.</p>
				</div>
				<Button className="refresh-button" onClick={() => setReloadKey(reloadKey + 1)} size="sm" type="button" variant="outline">
					<RefreshCw size={15}/> Refresh
				</Button>
			</div>
			<div aria-label="Billing record type" className="billing-tabs" role="group">
				{recordTypeList.map(({ icon: Icon, label, value }) => (
					<button aria-pressed={recordType === value} key={value} onClick={() => {
						setRecordType(value);
						setFilter('');
						setOffset(0);
					}} type="button">
						<Icon aria-hidden="true" size={15}/><span>{label}</span>
					</button>
				))}
			</div>
			<div className="table-toolbar">
				<label className="search-field">
					<Search aria-hidden="true" size={17}/>
					<input aria-label="Search billing records" onChange={(event) => {
						setSearch(event.target.value);
						setOffset(0);
					}} placeholder="Search users or games" value={search}/>
				</label>
				<label className="status-filter"><span>{recordType === 'acquisitions' ? 'Mechanism' : 'Status'}</span><select aria-label={`Filter ${recordType} records`} onChange={(event) => {
					setFilter(event.target.value);
					setOffset(0);
				}} value={filter}>
					<option value="">All records</option>
					{filterOptionList.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
				</select></label>
			</div>
			<div className="table-frame">
				<div className="institution-table-header billing-table-header"><span>User</span><span>Game</span><span>{recordType === 'payment-attempts' ? 'Payment' : recordType === 'licenses' ? 'License' : 'Acquisition'}</span><span>Recorded</span></div>
				{error && <div className="inline-error" role="alert"><AlertCircle size={17}/><span>{error}</span><Button onClick={() => setReloadKey(reloadKey + 1)} size="sm" variant="outline">Try again</Button></div>}
				{isLoading && <div aria-label="Loading billing records" className="table-loading"><span/><span/><span/><span/></div>}
				{!isLoading && !error && result?.itemList.length === 0 && <div className="empty-state"><div className="empty-mark"><CreditCard size={20}/></div><strong>No records found</strong><p>Try another user, game, or filter.</p></div>}
				{!isLoading && !error && result && result.itemList.length > 0 && <div className="institution-rows">{result.itemList.map((record) => <BillingRow key={record.id} record={record}/>)}</div>}
			</div>
			<div className="table-pagination">
				<span>{totalItemCount === 0 ? 'No records' : `Showing ${firstItem}–${lastItem} of ${totalItemCount}`}</span>
				<div>
					<Button aria-label="Previous page" disabled={offset === 0 || isLoading} onClick={() => setOffset(Math.max(0, offset - pageSize))} size="icon" variant="outline"><ChevronLeft size={16}/></Button>
					<Button aria-label="Next page" disabled={offset + pageSize >= totalItemCount || isLoading} onClick={() => setOffset(offset + pageSize)} size="icon" variant="outline"><ChevronRight size={16}/></Button>
				</div>
			</div>
		</section>
	);
}

function BillingRow({ record }: { record: BillingRecord }) {
	const statusLabel = record.status.replaceAll('_', ' ');
	return (
		<div className="institution-row billing-row">
			<div className="institution-name-cell billing-user"><div><strong>{record.userName}</strong><span>{record.userEmail}</span></div></div>
			<strong className="billing-game">{record.detailPath ? <Link to={record.detailPath}>{record.gameTitle}</Link> : record.gameTitle}</strong>
			<div className="billing-detail"><span className={`billing-state billing-state-${record.status}`}>{statusLabel}</span><small>{record.detail}</small></div>
			<time className="billing-created" dateTime={record.createdAt}>{formatDate(record.createdAt)}</time>
		</div>
	);
}

function formatDetailDate(value?: string): string {
	return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Unknown';
}

function formatDetailPrice(price: { currency: string; minorUnitAmount: number }): string {
	return new Intl.NumberFormat(undefined, { currency: price.currency, style: 'currency' }).format(price.minorUnitAmount / 100);
}

export function AcquisitionDetailPage() {
	const { id = '' } = useParams();
	const [acquisition, setAcquisition] = useState<AdminBillingAcquisitionDetail>();
	const [error, setError] = useState<string>();

	useEffect(() => {
		const controller = new AbortController();
		setAcquisition(undefined);
		setError(undefined);
		getAdminAcquisition(id, controller.signal)
			.then(setAcquisition)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Acquisition details could not be loaded.');
			});
		return () => controller.abort();
	}, [id]);

	return (
		<section className="page-content" aria-labelledby="page-title">
			<Link className="back-link" to="/billing"><ChevronLeft size={15}/> Billing & acquisitions</Link>
			{error && <div className="detail-error" role="alert"><AlertCircle size={18}/>{error}</div>}
			{!error && !acquisition && <div className="detail-loading">Loading acquisition...</div>}
			{acquisition && <>
				<div className="detail-heading">
					<div className="detail-mark"><ShoppingBag size={22}/></div>
					<div><p className="eyebrow">Platform / Acquisitions</p><h1 id="page-title">{acquisition.gameTitle}</h1><p className="page-description">{acquisition.userName} · {acquisition.userEmail}</p></div>
					<span className={`billing-state billing-state-${acquisition.mechanism}`}>{acquisition.mechanism.replaceAll('_', ' ')}</span>
				</div>
				<section className="detail-section">
					<h2>Acquisition</h2>
					<dl className="detail-grid">
						<div><dt>Recorded</dt><dd>{formatDetailDate(acquisition.createdAt)}</dd></div>
						<div><dt>Price</dt><dd>{formatDetailPrice(acquisition.price)}</dd></div>
						<div><dt>Game version</dt><dd>{acquisition.publisherVersion ?? 'Unknown'}{acquisition.language ? ` · ${acquisition.language}` : ''}{acquisition.mode ? ` · ${acquisition.mode.replaceAll('_', ' ')}` : ''}</dd></div>
						<div><dt>Assignment</dt><dd>{acquisition.classroomName ?? 'Public offer'}{acquisition.institutionName ? ` · ${acquisition.institutionName}` : ''}</dd></div>
						<div><dt>License status</dt><dd>{acquisition.license.status}</dd></div>
						<div><dt>License period</dt><dd>{formatDetailDate(acquisition.license.startAt)} – {formatDetailDate(acquisition.license.endAt)}</dd></div>
					</dl>
				</section>
				<section className="detail-section">
					<h2>Source</h2>
					{acquisition.paymentAttempt ? <dl className="detail-grid">
						<div><dt>Payment attempt</dt><dd>{acquisition.paymentAttempt.id}</dd></div>
						<div><dt>Payment status</dt><dd>{acquisition.paymentAttempt.status}</dd></div>
						<div><dt>Checkout session</dt><dd>{acquisition.paymentAttempt.stripeCheckoutSessionId ?? 'Unavailable'}</dd></div>
						<div><dt>Payment intent</dt><dd>{acquisition.paymentAttempt.stripePaymentIntentId ?? 'Unavailable'}</dd></div>
						<div><dt>Fulfilled</dt><dd>{formatDetailDate(acquisition.paymentAttempt.fulfilledAt)}</dd></div>
					</dl> : acquisition.codeRedemption ? <dl className="detail-grid">
						<div><dt>Acquisition code</dt><dd><Link to={`/acquisition-codes/${acquisition.codeRedemption.codeId}`}>{acquisition.codeRedemption.codeMask}</Link></dd></div>
						<div><dt>Redemption</dt><dd>{formatDetailDate(acquisition.codeRedemption.redeemedAt)}</dd></div>
						<div><dt>Code expiry</dt><dd>{formatDetailDate(acquisition.codeRedemption.expiresAt)}</dd></div>
					</dl> : <p>No direct source record is available for this historical acquisition.</p>}
				</section>
				<section className="detail-section">
					<h2>Activity</h2>
					{acquisition.eventList.length > 0 ? <ol className="acquisition-event-list">{acquisition.eventList.map((event) => <li key={event.id}>
						<div className="acquisition-event-heading"><strong>{event.eventType.replaceAll('_', ' ')}</strong><time dateTime={event.createdAt}>{formatDetailDate(event.createdAt)}</time></div>
						<p>{event.actorName ?? event.actorType}{event.reason ? ` · ${event.reason}` : ''}</p>
						{event.providerReference && <small>Provider reference: {event.providerReference}</small>}
						{event.correlationId && <small>Correlation ID: {event.correlationId}</small>}
					</li>)}</ol> : <p>No acquisition events recorded.</p>}
				</section>
			</>}
		</section>
	);
}