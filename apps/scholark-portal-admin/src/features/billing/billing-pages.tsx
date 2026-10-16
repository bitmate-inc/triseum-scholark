import { Button } from '@repo/ui/button';
import {
	AlertCircle,
	BarChart3,
	ChevronLeft,
	ChevronRight,
	CreditCard,
	Download,
	KeyRound,
	RefreshCw,
	Search,
	ShoppingBag,
} from 'lucide-react';
import {
	type FormEvent,
	useEffect,
	useState
} from 'react';
import { Link, useParams } from 'react-router-dom';

import {
	type AdminAcquisitionReport,
	type AdminBillingAcquisition,
	type AdminBillingAcquisitionDetail,
	type AdminBillingLicense,
	type AdminBillingPaymentAttempt,
	getAdminAcquisition,
	getAdminAcquisitionList,
	getAdminAcquisitionReport,
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

function csvCell(value: string | number | undefined): string {
	return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function downloadCsv(fileName: string, headerList: string[], rowList: Array<Array<string | number | undefined>>): void {
	const content = [headerList, ...rowList].map((row) => row.map(csvCell).join(',')).join('\r\n');
	const objectUrl = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
	const anchor = document.createElement('a');
	anchor.href = objectUrl;
	anchor.download = fileName;
	anchor.click();
	window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
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
				<div className="billing-heading-actions">
					<Link className="button button-subtle billing-report-link" to="/billing/reports"><BarChart3 size={15}/> Acquisition reports</Link>
					<Button className="refresh-button" onClick={() => setReloadKey(reloadKey + 1)} size="sm" type="button" variant="outline">
						<RefreshCw size={15}/> Refresh
					</Button>
				</div>
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

type AcquisitionReportView = 'publisher' | 'institution';

export function AcquisitionReportPage() {
	const [reportView, setReportView] = useState<AcquisitionReportView>('publisher');
	const [draftFrom, setDraftFrom] = useState('');
	const [draftTo, setDraftTo] = useState('');
	const [dateRange, setDateRange] = useState({ from: '', to: '' });
	const [reloadKey, setReloadKey] = useState(0);
	const [report, setReport] = useState<AdminAcquisitionReport>();
	const [error, setError] = useState<string>();
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(undefined);
		getAdminAcquisitionReport(dateRange.from, dateRange.to, controller.signal)
			.then(setReport)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Acquisition reports could not be loaded.');
			})
			.finally(() => setLoading(false));
		return () => controller.abort();
	}, [dateRange, reloadKey]);

	const applyDateRange = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setDateRange({ from: draftFrom, to: draftTo });
	};

	const exportReport = () => {
		if (!report) {
			return;
		}

		if (reportView === 'publisher') {
			downloadCsv('publisher-sales.csv', [
				'Publisher', 'Game', 'Currency', 'Paid acquisitions', 'Paid amount', 'Institution-funded license activations',
			], report.publisherReportList.map((item) => [
				item.publisherName,
				item.gameTitle,
				item.currency,
				item.paidAcquisitionCount,
				(item.paidSalesMinorUnitAmount / 100).toFixed(2),
				item.institutionFundedLicenseCount,
			]));
			return;
		}

		downloadCsv('institution-license-consumption.csv', [
			'Institution', 'Classroom', 'Game', 'Publisher', 'Publisher version', 'Codes issued', 'Code redemptions',
			'Unique code redeemers', 'Licenses granted', 'Unique licensees', 'Active licenses', 'Scheduled licenses',
			'Expired licenses', 'Informational listing quantity',
		], report.institutionReportList.map((item) => [
			item.institutionName,
			item.classroomName,
			item.gameTitle,
			item.publisherName,
			item.publisherVersion,
			item.codeIssuedCount,
			item.codeRedemptionCount,
			item.uniqueCodeRedeemerCount,
			item.institutionFundedLicenseCount,
			item.uniqueLicenseeCount,
			item.activeLicenseCount,
			item.scheduledLicenseCount,
			item.expiredLicenseCount,
			item.includedLicenseQuantity,
		]));
	};

	const reportItemCount = reportView === 'publisher'
		? report?.publisherReportList.length ?? 0
		: report?.institutionReportList.length ?? 0;

	return (
		<section className="page-content" aria-labelledby="page-title">
			<Link className="back-link" to="/billing"><ChevronLeft size={15}/> Billing & acquisitions</Link>
			<div className="page-heading">
				<div>
					<p className="eyebrow">Platform / Billing</p>
					<h1 id="page-title">Acquisition reports</h1>
					<p className="page-description">Recorded paid sales and institution-funded license activations.</p>
				</div>
				<div className="billing-heading-actions">
					<Button className="refresh-button" disabled={isLoading || !report || reportItemCount === 0} onClick={exportReport} size="sm" type="button" variant="outline">
						<Download size={15}/> Export CSV
					</Button>
					<Button className="refresh-button" disabled={isLoading} onClick={() => setReloadKey(reloadKey + 1)} size="sm" type="button" variant="outline">
						<RefreshCw size={15}/> Refresh
					</Button>
				</div>
			</div>
			<div aria-label="Acquisition report type" className="billing-tabs" role="group">
				<button aria-pressed={reportView === 'publisher'} onClick={() => setReportView('publisher')} type="button"><ShoppingBag aria-hidden="true" size={15}/><span>Publisher sales</span></button>
				<button aria-pressed={reportView === 'institution'} onClick={() => setReportView('institution')} type="button"><KeyRound aria-hidden="true" size={15}/><span>Institution licenses</span></button>
			</div>
			<div className="acquisition-report-toolbar">
				<form className="acquisition-report-date-filter" onSubmit={applyDateRange}>
					<label><span>From</span><input aria-label="Report start date" onChange={(event) => setDraftFrom(event.target.value)} type="date" value={draftFrom}/></label>
					<label><span>To</span><input aria-label="Report end date" onChange={(event) => setDraftTo(event.target.value)} type="date" value={draftTo}/></label>
					<Button disabled={isLoading} size="sm" type="submit" variant="outline">Apply dates</Button>
				</form>
				<p className="acquisition-report-definition">
					{reportView === 'publisher'
						? 'Paid amounts use completed acquisition dates. Institution-funded activations are shown separately and are not revenue.'
						: 'Codes and redemptions use their recorded dates; license counts use acquisition dates and status is current. Listing quantity is informational, not a cap.'}
				</p>
			</div>
			<div className="table-frame acquisition-report-frame">
				{reportView === 'publisher' ? <>
					<div className="institution-table-header acquisition-report-header publisher-report-grid"><span>Publisher / game</span><span>Paid acquisitions</span><span>Recorded paid amount</span><span>Institution activations</span></div>
					{error && <div className="inline-error" role="alert"><AlertCircle size={17}/><span>{error}</span><Button onClick={() => setReloadKey(reloadKey + 1)} size="sm" variant="outline">Try again</Button></div>}
					{isLoading && <div aria-label="Loading publisher sales report" className="table-loading"><span/><span/><span/><span/></div>}
					{!isLoading && !error && report?.publisherReportList.length === 0 && <div className="empty-state"><div className="empty-mark"><BarChart3 size={20}/></div><strong>No paid acquisitions found</strong><p>Try widening the date range.</p></div>}
					{!isLoading && !error && report && report.publisherReportList.length > 0 && <div className="institution-rows">{report.publisherReportList.map((item) => <div className="institution-row acquisition-report-row publisher-report-grid" key={`${item.publisherId}:${item.gameId}:${item.currency}`}>
						<div className="acquisition-report-title"><strong>{item.publisherName}</strong><small>{item.gameTitle}</small></div>
						<div className="acquisition-report-value"><span>Paid acquisitions</span><strong>{item.paidAcquisitionCount}</strong></div>
						<div className="acquisition-report-value"><span>Recorded paid amount</span><strong>{formatPrice({ currency: item.currency, minorUnitAmount: item.paidSalesMinorUnitAmount })}</strong></div>
						<div className="acquisition-report-value"><span>Institution activations</span><strong>{item.institutionFundedLicenseCount}</strong></div>
					</div>)}</div>}
				</> : <>
					<div className="institution-table-header acquisition-report-header institution-report-grid"><span>Institution / listing</span><span>Codes</span><span>People</span><span>Licenses granted</span><span>Current status</span><span>Listed quantity</span></div>
					{error && <div className="inline-error" role="alert"><AlertCircle size={17}/><span>{error}</span><Button onClick={() => setReloadKey(reloadKey + 1)} size="sm" variant="outline">Try again</Button></div>}
					{isLoading && <div aria-label="Loading institution license report" className="table-loading"><span/><span/><span/><span/></div>}
					{!isLoading && !error && report?.institutionReportList.length === 0 && <div className="empty-state"><div className="empty-mark"><KeyRound size={20}/></div><strong>No institution-funded listings found</strong><p>Published institution listings will appear here.</p></div>}
					{!isLoading && !error && report && report.institutionReportList.length > 0 && <div className="institution-rows">{report.institutionReportList.map((item) => <div className="institution-row acquisition-report-row institution-report-grid" key={item.listingId}>
						<div className="acquisition-report-title"><strong>{item.institutionName}</strong><small>{item.classroomName} · {item.gameTitle} · v{item.publisherVersion}</small></div>
						<div className="acquisition-report-value"><span>Issued / redeemed</span><strong>{item.codeIssuedCount} / {item.codeRedemptionCount}</strong></div>
						<div className="acquisition-report-value"><span>Redeemers / licensees</span><strong>{item.uniqueCodeRedeemerCount} / {item.uniqueLicenseeCount}</strong></div>
						<div className="acquisition-report-value"><span>Licenses granted</span><strong>{item.institutionFundedLicenseCount}</strong></div>
						<div className="acquisition-report-value acquisition-report-status"><span>Active · scheduled · expired</span><strong>{item.activeLicenseCount} · {item.scheduledLicenseCount} · {item.expiredLicenseCount}</strong></div>
						<div className="acquisition-report-value"><span>Informational quantity</span><strong>{item.includedLicenseQuantity ?? '—'}</strong></div>
					</div>)}</div>}
				</>}
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
						<div><dt>Game version</dt><dd>{acquisition.publisherVersion ?? 'Unknown'}{acquisition.language ? ` · ${acquisition.language}` : ''}{acquisition.courseType ? ` · ${acquisition.courseType.replaceAll('-', ' ')}` : ''}</dd></div>
						<div><dt>Assignment</dt><dd>{acquisition.classroomName ?? 'Public listing'}{acquisition.institutionName ? ` · ${acquisition.institutionName}` : ''}</dd></div>
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