import { Button } from '@repo/ui/button';
import {
	AlertCircle,
	ChevronLeft,
	ChevronRight,
	ExternalLink,
	RefreshCw,
	Search,
	Tags,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import {
	type AdminGameListing,
	type AdminGameListingListResponse,
	getAdminGameListingList,
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

function formatPrice(price?: { currency: string; minorUnitAmount: number }): string {
	if (!price) {
		return 'No student price';
	}
	return new Intl.NumberFormat(undefined, {
		currency: price.currency,
		style: 'currency',
	}).format(price.minorUnitAmount / 100);
}

export function GameListingListPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const listingType = searchParams.get('type') === 'classroom' || searchParams.get('type') === 'institution' ? 'classroom' : 'public';
	const [search, setSearch] = useState('');
	const [offset, setOffset] = useState(0);
	const [reloadKey, setReloadKey] = useState(0);
	const [result, setResult] = useState<AdminGameListingListResponse>();
	const [error, setError] = useState<string>();
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(undefined);
		getAdminGameListingList(listingType, search, offset, controller.signal)
			.then(setResult)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Game listings could not be loaded.');
			})
			.finally(() => setLoading(false));

		return () => controller.abort();
	}, [listingType, offset, reloadKey, search]);

	const totalItemCount = result?.totalItemCount ?? 0;
	const firstItem = totalItemCount === 0 ? 0 : offset + 1;
	const lastItem = Math.min(offset + pageSize, totalItemCount);

	function selectListingType(type: 'public' | 'classroom') {
		setSearchParams((current) => {
			const next = new URLSearchParams(current);
			next.set('type', type);
			return next;
		});
		setOffset(0);
	}

	return (
		<section className="page-content" aria-labelledby="page-title">
			<div className="page-heading">
				<div>
					<p className="eyebrow">Catalog</p>
					<h1 id="page-title">Game listings</h1>
					<p className="page-description">Review public availability and classroom listing terms.</p>
				</div>
				<Button className="refresh-button" onClick={() => setReloadKey(reloadKey + 1)} size="sm" type="button" variant="outline">
					<RefreshCw size={15}/> Refresh
				</Button>
			</div>
			<div aria-label="Listing category" className="listing-type-switch" role="group">
				<button aria-pressed={listingType === 'public'} onClick={() => selectListingType('public')} type="button">Public</button>
				<button aria-pressed={listingType === 'classroom'} onClick={() => selectListingType('classroom')} type="button">Classroom listings</button>
			</div>
			<div className="table-toolbar">
				<label className="search-field">
					<Search aria-hidden="true" size={17}/>
					<input aria-label="Search game listings" onChange={(event) => {
						setSearch(event.target.value);
						setOffset(0);
					}} placeholder="Search games or publishers" value={search}/>
				</label>
			</div>
			<div className="table-frame">
				<div className="institution-table-header listing-table-header"><span>Game</span><span>Configuration</span><span>Price</span><span>{listingType === 'public' ? 'Publication' : 'Listing terms'}</span><span/></div>
				{error && <div className="inline-error" role="alert"><AlertCircle size={17}/><span>{error}</span><Button onClick={() => setReloadKey(reloadKey + 1)} size="sm" variant="outline">Try again</Button></div>}
				{isLoading && <div aria-label="Loading game listings" className="table-loading"><span/><span/><span/><span/></div>}
				{!isLoading && !error && result?.listingList.length === 0 && <div className="empty-state"><div className="empty-mark"><Tags size={20}/></div><strong>{listingType === 'public' ? 'No public listings found' : 'No classroom listings found'}</strong><p>Try a different game or publisher search.</p></div>}
				{!isLoading && !error && result && result.listingList.length > 0 && <div className="institution-rows">{result.listingList.map((listing) => <GameListingRow gameListing={listing} key={listing.id}/>)}</div>}
			</div>
			<div className="table-pagination">
				<span>{totalItemCount === 0 ? 'No listings' : `Showing ${firstItem}–${lastItem} of ${totalItemCount}`}</span>
				<div>
					<Button aria-label="Previous page" disabled={offset === 0 || isLoading} onClick={() => setOffset(Math.max(0, offset - pageSize))} size="icon" variant="outline"><ChevronLeft size={16}/></Button>
					<Button aria-label="Next page" disabled={offset + pageSize >= totalItemCount || isLoading} onClick={() => setOffset(offset + pageSize)} size="icon" variant="outline"><ChevronRight size={16}/></Button>
				</div>
			</div>
		</section>
	);
}

function GameListingRow({ gameListing }: { gameListing: AdminGameListing }) {
	const version = gameListing.gameVersion;
	const configuration = gameListing.listingType === 'public'
		? [...new Set(gameListing.priceGroupList?.flatMap((priceGroup) => priceGroup.languageList) ?? [])].join(', ')
		: [gameListing.language, gameListing.courseType?.replaceAll('-', ' ')].filter(Boolean).join(' · ');
	const priceDescription = gameListing.listingType === 'public'
		? gameListing.priceGroupList?.map((priceGroup) => `${formatPrice(priceGroup.price)} · ${priceGroup.languageList.join(', ')}`).join(' / ') || 'No language prices'
		: formatPrice(gameListing.price);
	const detailHref = gameListing.listingType === 'classroom' ? `/classroom-game-listings/${gameListing.id}` : `/games/${gameListing.game.id}`;
	return (
		<div className="institution-row listing-row">
			<div className="institution-name-cell">
				<div className="institution-row-mark"><Tags size={16}/></div>
				<div><Link to={detailHref}>{gameListing.game.title}</Link><span><Link className="listing-publisher-link" to={`/publishers/${gameListing.publisher.id}`}>{gameListing.publisher.name}</Link></span></div>
			</div>
			<div className="listing-variant"><span>Version {version.publisherVersion}</span><small>{configuration || 'No language configuration'}</small></div>
			<span className="listing-price">{priceDescription}</span>
			<div className="listing-terms">
				{gameListing.listingType === 'public' ? <>
					<span className={`publication-state state-${publicationState(gameListing.publishedAt)}`}>{publicationLabel(gameListing.publishedAt)}</span>
					<small>{gameListing.available ? 'Available' : 'Unavailable'}</small>
				</> : <>
					<span>{gameListing.designatedPayor === 'institution' ? 'Institution pays' : 'Student pays'}</span>
					{gameListing.classroom && <Link to={`/classrooms/${gameListing.classroom.id}`}>{gameListing.classroom.name} · {gameListing.classroom.institutionName}</Link>}
					<small>{gameListing.licenseDurationDays} days{typeof gameListing.includedLicenseQuantity === 'number' ? ` · ${gameListing.includedLicenseQuantity} included` : ''}</small>
				</>}
			</div>
			<Link aria-label={`Open ${gameListing.game.title}`} className="row-open" to={detailHref}><ExternalLink size={15}/></Link>
		</div>
	);
}