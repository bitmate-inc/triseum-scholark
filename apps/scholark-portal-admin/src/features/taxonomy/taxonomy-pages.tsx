import { Button } from '@repo/ui/button';
import {
	AlertCircle,
	Check,
	ChevronLeft,
	ChevronRight,
	Pencil,
	Plus,
	RefreshCw,
	Search,
	Tags,
	X,
} from 'lucide-react';
import {
	type FormEvent,
	useEffect,
	useState
} from 'react';

import {
	createTaxonomyTerm,
	type CreateTaxonomyTermInput,
	getTaxonomyTermList,
	type TaxonomyTerm,
	type TaxonomyTermListResponse,
	type TaxonomyTermType,
	updateTaxonomyTerm,
} from '../../lib/admin-api';

const pageSize = 10;

export function TaxonomyListPage() {
	const [search, setSearch] = useState('');
	const [type, setType] = useState('');
	const [offset, setOffset] = useState(0);
	const [reloadKey, setReloadKey] = useState(0);
	const [isCreateOpen, setCreateOpen] = useState(false);
	const [editingTerm, setEditingTerm] = useState<TaxonomyTerm>();
	const [result, setResult] = useState<TaxonomyTermListResponse>();
	const [error, setError] = useState<string>();
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(undefined);
		getTaxonomyTermList(search, offset, type, controller.signal)
			.then(setResult)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Taxonomy terms could not be loaded.');
			})
			.finally(() => setLoading(false));

		return () => controller.abort();
	}, [offset, reloadKey, search, type]);

	const totalItemCount = result?.totalItemCount ?? 0;
	const firstItem = totalItemCount === 0 ? 0 : offset + 1;
	const lastItem = Math.min(offset + pageSize, totalItemCount);

	return (
		<section className="page-content" aria-labelledby="page-title">
			<div className="page-heading">
				<div>
					<p className="eyebrow">Catalog</p>
					<h1 id="page-title">Taxonomy</h1>
					<p className="page-description">Browse the terms used to organize games and learning spaces.</p>
				</div>
				<div className="institution-heading-actions">
					<Button className="refresh-button" onClick={() => {
						setEditingTerm(undefined);
						setCreateOpen(!isCreateOpen);
					}} size="sm" type="button" variant={isCreateOpen ? 'outline' : 'default'}>
						{isCreateOpen ? <X size={15}/> : <Plus size={15}/>} {isCreateOpen ? 'Cancel' : 'Add term'}
					</Button>
					<Button className="refresh-button" onClick={() => setReloadKey(reloadKey + 1)} size="sm" type="button" variant="outline">
						<RefreshCw size={15}/> Refresh
					</Button>
				</div>
			</div>
			{(isCreateOpen || editingTerm) && (
				<TaxonomyTermForm
					key={editingTerm?.id ?? 'new'}
					onCancel={() => {
						setCreateOpen(false);
						setEditingTerm(undefined);
					}}
					onSubmit={async (input) => {
						if (editingTerm) {
							await updateTaxonomyTerm(editingTerm.id, input);
						} else {
							await createTaxonomyTerm(input);
						}
						setCreateOpen(false);
						setEditingTerm(undefined);
						setReloadKey((current) => current + 1);
					}}
					submitLabel={editingTerm ? 'Save changes' : 'Create term'}
					term={editingTerm}
				/>
			)}
			<div className="table-toolbar">
				<label className="search-field">
					<Search aria-hidden="true" size={17}/>
					<input aria-label="Search taxonomy terms" onChange={(event) => {
						setSearch(event.target.value);
						setOffset(0);
					}} placeholder="Search labels or slugs" value={search}/>
				</label>
				<label className="status-filter"><span>Type</span><select aria-label="Filter taxonomy by type" onChange={(event) => {
					setType(event.target.value);
					setOffset(0);
				}} value={type}>
					<option value="">All types</option>
					<option value="category">Category</option>
					<option value="genre">Genre</option>
					<option value="skill">Skill</option>
					<option value="subject">Subject</option>
					<option value="theme">Theme</option>
				</select></label>
			</div>
			<div className="table-frame">
				<div className="institution-table-header taxonomy-table-header"><span>Term</span><span>Type</span><span>Slug</span><span/></div>
				{error && <div className="inline-error" role="alert"><AlertCircle size={17}/><span>{error}</span><Button onClick={() => setReloadKey(reloadKey + 1)} size="sm" variant="outline">Try again</Button></div>}
				{isLoading && <div aria-label="Loading taxonomy terms" className="table-loading"><span/><span/><span/></div>}
				{!isLoading && !error && result?.taxonomyTermList.length === 0 && <div className="empty-state"><div className="empty-mark"><Tags size={20}/></div><strong>No taxonomy terms found</strong><p>Try a different label, slug, or type.</p></div>}
				{!isLoading && !error && result && result.taxonomyTermList.length > 0 && <div className="institution-rows">{result.taxonomyTermList.map((term) => <TaxonomyTermRow key={term.id} onEdit={() => {
					setCreateOpen(false);
					setEditingTerm(term);
				}} term={term}/>)}</div>}
			</div>
			<div className="table-pagination">
				<span>{totalItemCount === 0 ? 'No terms' : `Showing ${firstItem}–${lastItem} of ${totalItemCount}`}</span>
				<div>
					<Button aria-label="Previous page" disabled={offset === 0 || isLoading} onClick={() => setOffset(Math.max(0, offset - pageSize))} size="icon" variant="outline"><ChevronLeft size={16}/></Button>
					<Button aria-label="Next page" disabled={offset + pageSize >= totalItemCount || isLoading} onClick={() => setOffset(offset + pageSize)} size="icon" variant="outline"><ChevronRight size={16}/></Button>
				</div>
			</div>
		</section>
	);
}

function TaxonomyTermRow({ onEdit, term }: { onEdit: () => void; term: TaxonomyTerm }) {
	return (
		<div className="institution-row taxonomy-row">
			<div className="institution-name-cell">
				<div className="institution-row-mark"><Tags size={16}/></div>
				<div><strong>{term.label}</strong><span>{term.id}</span></div>
			</div>
			<span className="taxonomy-type-badge">{term.type}</span>
			<span className="institution-slug">{term.slug}</span>
			<Button aria-label={`Edit ${term.label}`} className="row-open" onClick={onEdit} size="icon" type="button" variant="ghost"><Pencil size={14}/></Button>
		</div>
	);
}

function TaxonomyTermForm({
	onCancel,
	onSubmit,
	submitLabel,
	term,
}: {
	onCancel: () => void;
	onSubmit: (input: CreateTaxonomyTermInput) => Promise<void>;
	submitLabel: string;
	term?: TaxonomyTerm;
}) {
	const [label, setLabel] = useState(term?.label ?? '');
	const [slug, setSlug] = useState(term?.slug ?? '');
	const [slugEdited, setSlugEdited] = useState(Boolean(term));
	const [type, setType] = useState<TaxonomyTermType>(term?.type ?? 'category');
	const [error, setError] = useState<string>();
	const [isSaving, setSaving] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
		event.preventDefault();
		setError(undefined);
		setSaving(true);
		try {
			await onSubmit({ label: label.trim(), slug: slug.trim(), type });
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : 'Taxonomy term could not be saved.');
		} finally {
			setSaving(false);
		}
	}

	return (
		<form className="institution-form" onSubmit={handleSubmit}>
			<div className="institution-form-fields">
				<label>Label<input autoComplete="off" maxLength={160} onChange={(event) => {
					const value = event.target.value;
					setLabel(value);
					if (!slugEdited) {
						setSlug(value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
					}
				}} required value={label}/></label>
				<label>Slug<input aria-label="Taxonomy term slug" maxLength={160} onChange={(event) => {
					setSlugEdited(true);
					setSlug(event.target.value.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, ''));
				}} pattern="[a-z0-9]+(-[a-z0-9]+)*" required value={slug}/></label>
				<label>Type<select onChange={(event) => setType(event.target.value as TaxonomyTermType)} value={type}>
					<option value="category">Category</option>
					<option value="genre">Genre</option>
					<option value="skill">Skill</option>
					<option value="subject">Subject</option>
					<option value="theme">Theme</option>
				</select></label>
			</div>
			{error && <div className="institution-form-error" role="alert"><AlertCircle size={16}/>{error}</div>}
			<div className="institution-form-actions">
				<Button disabled={isSaving} onClick={onCancel} size="sm" type="button" variant="outline"><X size={14}/> Cancel</Button>
				<Button disabled={isSaving} size="sm" type="submit"><Check size={14}/>{isSaving ? 'Saving...' : submitLabel}</Button>
			</div>
		</form>
	);
}