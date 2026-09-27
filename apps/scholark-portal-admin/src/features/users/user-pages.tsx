import { Button } from '@repo/ui/button';
import {
	AlertCircle,
	ChevronLeft,
	ChevronRight,
	RefreshCw,
	Search,
	ShieldCheck,
	UserRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import {
	type AdminAccountUser,
	type AdminAccountUserListResponse,
	getAdminAccountUserList,
} from '../../lib/admin-api';

const pageSize = 10;
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

export function UserListPage() {
	const [search, setSearch] = useState('');
	const [status, setStatus] = useState('');
	const [offset, setOffset] = useState(0);
	const [reloadKey, setReloadKey] = useState(0);
	const [result, setResult] = useState<AdminAccountUserListResponse>();
	const [error, setError] = useState<string>();
	const [isLoading, setLoading] = useState(true);

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(undefined);
		getAdminAccountUserList(search, offset, status, controller.signal)
			.then(setResult)
			.catch((requestError: unknown) => {
				if (requestError instanceof DOMException && requestError.name === 'AbortError') {
					return;
				}
				setError(requestError instanceof Error ? requestError.message : 'Users could not be loaded.');
			})
			.finally(() => setLoading(false));

		return () => controller.abort();
	}, [offset, reloadKey, search, status]);

	const totalItemCount = result?.totalItemCount ?? 0;
	const firstItem = totalItemCount === 0 ? 0 : offset + 1;
	const lastItem = Math.min(offset + pageSize, totalItemCount);

	return (
		<section className="page-content" aria-labelledby="page-title">
			<div className="page-heading">
				<div>
					<p className="eyebrow">Platform</p>
					<h1 id="page-title">Users</h1>
					<p className="page-description">Review portal accounts and administrator access.</p>
				</div>
				<Button className="refresh-button" onClick={() => setReloadKey(reloadKey + 1)} size="sm" type="button" variant="outline">
					<RefreshCw size={15}/> Refresh
				</Button>
			</div>
			<div className="table-toolbar">
				<label className="search-field">
					<Search aria-hidden="true" size={17}/>
					<input aria-label="Search users" onChange={(event) => {
						setSearch(event.target.value);
						setOffset(0);
					}} placeholder="Search name or email" value={search}/>
				</label>
				<label className="status-filter"><span>Account</span><select aria-label="Filter users by account status" onChange={(event) => {
					setStatus(event.target.value);
					setOffset(0);
				}} value={status}>
					<option value="">All statuses</option>
					<option value="active">Active</option>
					<option value="pending">Pending</option>
				</select></label>
			</div>
			<div className="table-frame">
				<div className="institution-table-header users-table-header"><span>User</span><span>Account</span><span>Access</span><span>Created</span></div>
				{error && <div className="inline-error" role="alert"><AlertCircle size={17}/><span>{error}</span><Button onClick={() => setReloadKey(reloadKey + 1)} size="sm" variant="outline">Try again</Button></div>}
				{isLoading && <div aria-label="Loading users" className="table-loading"><span/><span/><span/><span/></div>}
				{!isLoading && !error && result?.userList.length === 0 && <div className="empty-state"><div className="empty-mark"><UserRound size={20}/></div><strong>No users found</strong><p>Try another name, email, or account status.</p></div>}
				{!isLoading && !error && result && result.userList.length > 0 && <div className="institution-rows">{result.userList.map((user) => <UserRow key={user.id} user={user}/>)}</div>}
			</div>
			<div className="table-pagination">
				<span>{totalItemCount === 0 ? 'No users' : `Showing ${firstItem}–${lastItem} of ${totalItemCount}`}</span>
				<div>
					<Button aria-label="Previous page" disabled={offset === 0 || isLoading} onClick={() => setOffset(Math.max(0, offset - pageSize))} size="icon" variant="outline"><ChevronLeft size={16}/></Button>
					<Button aria-label="Next page" disabled={offset + pageSize >= totalItemCount || isLoading} onClick={() => setOffset(offset + pageSize)} size="icon" variant="outline"><ChevronRight size={16}/></Button>
				</div>
			</div>
		</section>
	);
}

function UserRow({ user }: { user: AdminAccountUser }) {
	const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Name not provided';
	const createdAt = user.createdAt ? dateFormat.format(new Date(user.createdAt)) : 'Unknown';
	return (
		<div className="institution-row users-row">
			<div className="institution-name-cell">
				<div className="institution-row-mark"><UserRound size={16}/></div>
				<div><strong>{displayName}</strong><span>{user.email}</span></div>
			</div>
			<span className={`status-badge status-${user.status === 'active' ? 'active' : 'pending'}`}>{user.status}</span>
			<span className={`user-access${user.isAdmin ? ' is-admin' : ''}`}>{user.isAdmin && <ShieldCheck size={14}/>} {user.isAdmin ? 'Administrator' : 'Standard account'}</span>
			<span className="user-created-date">{createdAt}</span>
		</div>
	);
}