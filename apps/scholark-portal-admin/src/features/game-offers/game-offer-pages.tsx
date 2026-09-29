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
	type AdminGameOffer,
	type AdminGameOfferListResponse,
	getAdminGameOfferList,
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

function formatPrice(price: { currency: string; minorUnitAmount: number }): string {
	return new Intl.NumberFormat(undefined, {
		currency: price.currency,
		style: 'currency',
	}).format(price.minorUnitAmount / 100);
}

export function GameOfferListPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const offerType = searchParams.get('type') === 'institution' ? 'institution' : 'public';
	const [search, setSearch] = useState('');
	const [offset, setOffset] = useState(0);
	const [reloadKey, setReloadKey] = useState(0);
	const [result, setResult] = useState<AdminGameOfferListResponse>();
	const [error, setError] = useState<string>();
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(undefined);
		getAdminGameOfferList(offerType, search, offset, controller.signal)
			.then(setResult)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Game offers could not be loaded.');
			})
			.finally(() => setLoading(false));

		return () => controller.abort();
	}, [offerType, offset, reloadKey, search]);

	const totalItemCount = result?.totalItemCount ?? 0;
	const firstItem = totalItemCount === 0 ? 0 : offset + 1;
	const lastItem = Math.min(offset + pageSize, totalItemCount);

	function selectOfferType(type: 'public' | 'institution') {
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
					<h1 id="page-title">Game offers</h1>
					<p className="page-description">Review public availability and institution licensing terms.</p>
				</div>
				<Button className="refresh-button" onClick={() => setReloadKey(reloadKey + 1)} size="sm" type="button" variant="outline">
					<RefreshCw size={15}/> Refresh
				</Button>
			</div>
			<div aria-label="Offer category" className="offer-type-switch" role="group">
				<button aria-pressed={offerType === 'public'} onClick={() => selectOfferType('public')} type="button">Public</button>
				<button aria-pressed={offerType === 'institution'} onClick={() => selectOfferType('institution')} type="button">Institution</button>
			</div>
			<div className="table-toolbar">
				<label className="search-field">
					<Search aria-hidden="true" size={17}/>
					<input aria-label="Search game offers" onChange={(event) => {
						setSearch(event.target.value);
						setOffset(0);
					}} placeholder="Search games or publishers" value={search}/>
				</label>
			</div>
			<div className="table-frame">
				<div className="institution-table-header offer-table-header"><span>Game</span><span>Variant</span><span>Price</span><span>{offerType === 'public' ? 'Publication' : 'License terms'}</span><span/></div>
				{error && <div className="inline-error" role="alert"><AlertCircle size={17}/><span>{error}</span><Button onClick={() => setReloadKey(reloadKey + 1)} size="sm" variant="outline">Try again</Button></div>}
				{isLoading && <div aria-label="Loading game offers" className="table-loading"><span/><span/><span/><span/></div>}
				{!isLoading && !error && result?.offerList.length === 0 && <div className="empty-state"><div className="empty-mark"><Tags size={20}/></div><strong>No {offerType} offers found</strong><p>Try a different game or publisher search.</p></div>}
				{!isLoading && !error && result && result.offerList.length > 0 && <div className="institution-rows">{result.offerList.map((offer) => <GameOfferRow gameOffer={offer} key={offer.id}/>)}</div>}
			</div>
			<div className="table-pagination">
				<span>{totalItemCount === 0 ? 'No offers' : `Showing ${firstItem}–${lastItem} of ${totalItemCount}`}</span>
				<div>
					<Button aria-label="Previous page" disabled={offset === 0 || isLoading} onClick={() => setOffset(Math.max(0, offset - pageSize))} size="icon" variant="outline"><ChevronLeft size={16}/></Button>
					<Button aria-label="Next page" disabled={offset + pageSize >= totalItemCount || isLoading} onClick={() => setOffset(offset + pageSize)} size="icon" variant="outline"><ChevronRight size={16}/></Button>
				</div>
			</div>
		</section>
	);
}

function GameOfferRow({ gameOffer }: { gameOffer: AdminGameOffer }) {
	const variant = gameOffer.gameVariant;
	const version = gameOffer.gameVersion;
	return (
		<div className="institution-row offer-row">
			<div className="institution-name-cell">
				<div className="institution-row-mark"><Tags size={16}/></div>
				<div><Link to={`/games/${gameOffer.game.id}`}>{gameOffer.game.title}</Link><span><Link className="offer-publisher-link" to={`/publishers/${gameOffer.publisher.id}`}>{gameOffer.publisher.name}</Link></span></div>
			</div>
			<div className="offer-variant"><span>Version {version.publisherVersion}</span><small>{variant.language} · {variant.mode.replaceAll('_', ' ')}</small></div>
			<span className="offer-price">{formatPrice(gameOffer.price)}</span>
			<div className="offer-terms">
				{gameOffer.offerType === 'public' ? <>
					<span className={`publication-state state-${publicationState(gameOffer.publishedAt)}`}>{publicationLabel(gameOffer.publishedAt)}</span>
					<small>{gameOffer.available ? 'Available' : 'Unavailable'}</small>
				</> : <>
					<span>{gameOffer.designatedPayor} pays</span>
					<small>{gameOffer.licenseDurationDays} days{typeof gameOffer.allocatedLicenseQuantity === 'number' ? ` · ${gameOffer.allocatedLicenseQuantity} licenses` : ''}</small>
				</>}
			</div>
			<Link aria-label={`Open ${gameOffer.game.title}`} className="row-open" to={`/games/${gameOffer.game.id}`}><ExternalLink size={15}/></Link>
		</div>
	);
}