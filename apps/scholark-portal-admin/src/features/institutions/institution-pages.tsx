import { Button } from '@repo/ui/button';
import {
	AlertCircle,
	ArrowLeft,
	Building2,
	ChevronLeft,
	ChevronRight,
	ExternalLink,
	RefreshCw,
	Search
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
	getInstitution,
	getInstitutionList,
	type Institution,
	type InstitutionListResponse
} from '../../lib/admin-api';

const pageSize = 10;

export function InstitutionListPage() {
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [offset, setOffset] = useState(0);
	const [reloadKey, setReloadKey] = useState(0);
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
				<Button className="refresh-button" onClick={() => setReloadKey(reloadKey + 1)} size="sm" type="button" variant="outline">
					<RefreshCw size={15}/> Refresh
				</Button>
			</div>
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
			{institution && <InstitutionDetails institution={institution}/>}
		</section>
	);
}

function InstitutionDetails({ institution }: { institution: Institution }) {
	return (
		<>
			<div className="detail-heading">
				<div className="detail-mark"><Building2 size={22}/></div>
				<div>
					<p className="eyebrow">Education / Institutions</p>
					<h1 id="page-title">{institution.name}</h1>
					<p className="page-description">{institution.slug}</p>
				</div>
				<span className={`status-badge status-${institution.status}`}>{institution.status}</span>
			</div>
			<div className="detail-section">
				<h2>Institution profile</h2>
				<dl className="detail-grid">
					<div><dt>Portal status</dt><dd>{institution.status}</dd></div>
					<div><dt>Slug</dt><dd>{institution.slug}</dd></div>
					<div><dt>Website</dt><dd>{institution.websiteUrl ? <a href={institution.websiteUrl} rel="noreferrer" target="_blank">{institution.websiteUrl}<ExternalLink size={13}/></a> : 'Not provided'}</dd></div>
					<div><dt>Summary</dt><dd>{institution.summary || 'No summary provided.'}</dd></div>
				</dl>
			</div>
			<div className="detail-section muted-section">
				<h2>Learning spaces</h2>
				<p>Classrooms, courses, and classroom games will appear here as their admin endpoints are added.</p>
			</div>
		</>
	);
}