import { Button } from '@repo/ui/button';
import {
	BookOpen,
	Building2,
	ChevronDown,
	ChevronLeft,
	CreditCard,
	Gamepad2,
	GraduationCap,
	LayoutDashboard,
	LogOut,
	Menu,
	PanelLeftClose,
	Settings2,
	Tags,
	Users,
	X,
} from 'lucide-react';
import { useState } from 'react';
import {
	Navigate,
	NavLink,
	Route,
	Routes,
	useLocation
} from 'react-router-dom';

import {
	AdminAuthProvider,
	type AdminUser,
	useAdminAuth
} from './auth/admin-auth-context';
import { LoginPage } from './auth/login-page';
import { InstitutionDetailPage, InstitutionListPage } from './features/institutions/institution-pages';

const navigation = [
	{
		label: 'Overview',
		items: [{ label: 'Dashboard', path: '/', icon: LayoutDashboard }],
	},
	{
		label: 'Education',
		items: [
			{ label: 'Institutions', path: '/institutions', icon: Building2 },
			{ label: 'Classrooms', path: '/classrooms', icon: GraduationCap },
			{ label: 'Classroom games', path: '/classroom-games', icon: Gamepad2 },
			{ label: 'Courses', path: '/courses', icon: BookOpen },
			{ label: 'Instructors', path: '/instructors', icon: Users },
		],
	},
	{
		label: 'Catalog',
		items: [
			{ label: 'Publishers', path: '/publishers', icon: Building2 },
			{ label: 'Games', path: '/games', icon: Gamepad2 },
			{ label: 'Game offers', path: '/game-offers', icon: Tags },
			{ label: 'Taxonomy', path: '/taxonomy', icon: Settings2 },
		],
	},
	{
		label: 'Platform',
		items: [
			{ label: 'Users', path: '/users', icon: Users },
			{ label: 'Billing & acquisitions', path: '/billing', icon: CreditCard },
		],
	},
];

const pageDescriptions: Record<string, { eyebrow: string; title: string; detail: string }> = {
	'/': { eyebrow: 'Workspace', title: 'Administration overview', detail: 'Operational tools for the ScholArk portal.' },
	'/institutions': { eyebrow: 'Education', title: 'Institutions', detail: 'Review institution records and their portal status.' },
	'/classrooms': { eyebrow: 'Education', title: 'Classrooms', detail: 'Manage classroom records across institutions.' },
	'/classroom-games': { eyebrow: 'Education', title: 'Classroom games', detail: 'Review game assignments made available to classrooms.' },
	'/courses': { eyebrow: 'Education', title: 'Courses', detail: 'Manage course records and institutional associations.' },
	'/instructors': { eyebrow: 'Education', title: 'Instructors', detail: 'Review instructor accounts and institutional access.' },
	'/publishers': { eyebrow: 'Catalog', title: 'Publishers', detail: 'Manage publisher accounts and catalog ownership.' },
	'/games': { eyebrow: 'Catalog', title: 'Games', detail: 'Review games, versions, and publication status.' },
	'/game-offers': { eyebrow: 'Catalog', title: 'Game offers', detail: 'Manage institution-facing offers and availability.' },
	'/taxonomy': { eyebrow: 'Catalog', title: 'Taxonomy', detail: 'Organize portal discovery categories and terms.' },
	'/users': { eyebrow: 'Platform', title: 'Users', detail: 'Search portal accounts and review account status.' },
	'/billing': { eyebrow: 'Platform', title: 'Billing & acquisitions', detail: 'Review acquisition activity and billing records.' },
};

function AdminPage({ path }: { path: string }) {
	const page = pageDescriptions[path] ?? pageDescriptions['/'];

	return (
		<section className="page-content" aria-labelledby="page-title">
			<div className="page-heading">
				<div>
					<p className="eyebrow">{page.eyebrow}</p>
					<h1 id="page-title">{page.title}</h1>
					<p className="page-description">{page.detail}</p>
				</div>
			</div>
			<div className="table-frame">
				<div className="empty-state">
					<div className="empty-mark"><Building2 size={20}/></div>
					<strong>{page.title} API not connected</strong>
					<p>This section is staged in the admin navigation while its API workflow is being defined.</p>
				</div>
			</div>
		</section>
	);
}

export default function App() {
	return (
		<AdminAuthProvider>
			<AdminRouter/>
		</AdminAuthProvider>
	);
}

function AdminRouter() {
	const location = useLocation();
	const { logout, status, user } = useAdminAuth();
	if (location.pathname === '/login') {
		if (status === 'signed-in') {
			return <Navigate replace to="/institutions"/>;
		}

		return <LoginPage/>;
	}
	if (status === 'checking') {
		return <div className="session-loading">Checking administrator access...</div>;
	}
	if (status === 'signed-out' || status === 'unavailable') {
		return <Navigate replace state={{ from: location }} to="/login"/>;
	}
	if (status === 'forbidden') {
		return (
			<div className="access-denied">
				<div className="empty-mark"><Building2 size={20}/></div>
				<p className="eyebrow">ACCESS RESTRICTED</p>
				<h1>Administrator access required</h1>
				<p>This ScholArk account is not provisioned for portal administration.</p>
				<Button onClick={logout} size="sm" variant="outline"><LogOut size={15}/> Sign out</Button>
			</div>
		);
	}

	return <AdminShell user={user!}/>;
}

function AdminShell({ user }: { user: AdminUser }) {
	const location = useLocation();
	const [isSidebarOpen, setSidebarOpen] = useState(false);
	const [isCollapsed, setCollapsed] = useState(false);
	const { logout } = useAdminAuth();
	const activePage = pageDescriptions[location.pathname]
		?? (location.pathname.startsWith('/institutions/') ? pageDescriptions['/institutions'] : pageDescriptions['/']);
	const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
	const initials = displayName.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');

	return (
		<div className={`admin-app${isCollapsed ? ' is-collapsed' : ''}`}>
			{isSidebarOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}/>}
			<aside className={`sidebar${isSidebarOpen ? ' is-open' : ''}`}>
				<div className="brand-row">
					<div className="brand-mark" aria-hidden="true">S</div>
					<div className="brand-copy"><strong>ScholArk</strong><span>PORTAL ADMIN</span></div>
					<button className="icon-button mobile-close" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}><X size={18}/></button>
				</div>
				<button className="workspace-switcher" type="button">
					<span className="workspace-icon"><Building2 size={16}/></span>
					<span className="workspace-copy"><strong>Portal workspace</strong><small>Administration</small></span>
					<ChevronDown size={15}/>
				</button>
				<nav className="side-nav" aria-label="Admin sections">
					{navigation.map((group) => (
						<div className="nav-group" key={group.label}>
							<p className="nav-group-label">{group.label}</p>
							{group.items.map(({ label, path, icon: Icon }) => (
								<NavLink
									className={({ isActive }) => `nav-link${isActive && (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)) ? ' is-active' : ''}`}
									end={path === '/'}
									key={path}
									to={path}
									onClick={() => setSidebarOpen(false)}
								>
									<Icon size={17} strokeWidth={1.8}/>
									<span>{label}</span>
								</NavLink>
							))}
						</div>
					))}
				</nav>
				<div className="sidebar-bottom">
					<button className="collapse-button" type="button" onClick={() => setCollapsed(!isCollapsed)}>
						<PanelLeftClose size={17}/><span>Collapse sidebar</span><ChevronLeft size={15} className="collapse-chevron"/>
					</button>
					<div className="user-profile">
						<div className="user-avatar">{initials}</div>
						<div className="user-copy"><strong>{displayName}</strong><span>Portal administrator</span></div>
						<button aria-label="Sign out" className="profile-logout" onClick={logout} title="Sign out" type="button"><LogOut size={15}/></button>
					</div>
				</div>
			</aside>
			<main className="main-panel">
				<header className="topbar">
					<div className="topbar-leading">
						<button className="icon-button menu-toggle" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={20}/></button>
						<div className="breadcrumbs"><span>ScholArk Admin</span><span className="breadcrumb-divider">/</span><strong>{activePage.title}</strong></div>
					</div>
					<div className="topbar-trailing"><span className="environment-tag"><span/> LIVE PORTAL</span><button className="icon-button settings-button" aria-label="Settings"><Settings2 size={18}/></button></div>
				</header>
				<Routes>
					<Route element={<InstitutionListPage/>} path="/institutions"/>
					<Route element={<InstitutionDetailPage/>} path="/institutions/:id"/>
					{Object.keys(pageDescriptions).map((path) => <Route element={<AdminPage path={path}/>} key={path} path={path}/>)}
					<Route element={<Navigate replace to="/institutions"/>} path="*"/>
				</Routes>
				<footer className="app-footer"><span>ScholArk Portal Administration</span><span>v0.1</span></footer>
			</main>
		</div>
	);
}