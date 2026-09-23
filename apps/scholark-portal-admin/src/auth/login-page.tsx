import { Button } from '@repo/ui/button';
import {
	ArrowRight,
	LockKeyhole,
	ShieldCheck
} from 'lucide-react';
import { type FormEvent,useState } from 'react';
import {
	Navigate,
	useLocation,
	useNavigate
} from 'react-router-dom';

import { useAdminAuth } from './admin-auth-context';

export function LoginPage() {
	const { login, status } = useAdminAuth();
	const location = useLocation();
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string>();
	const [isSubmitting, setSubmitting] = useState(false);
	const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/institutions';

	if (status === 'signed-in') {
		return <Navigate replace to="/institutions"/>;
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
		event.preventDefault();
		setError(undefined);
		setSubmitting(true);
		const message = await login(email.trim(), password);
		setSubmitting(false);
		if (message) {
			setError(message);
			return;
		}

		navigate(destination, { replace: true });
	}

	return (
		<div className="login-screen">
			<div className="login-rail">
				<div className="login-brand"><div className="brand-mark">S</div><span>ScholArk</span></div>
				<div className="login-rail-content">
					<p className="eyebrow">PORTAL ADMINISTRATION</p>
					<h1>Steward the learning experience.</h1>
					<p>One workspace for institutions, learning content, and portal operations.</p>
					<div className="rail-stamp"><ShieldCheck size={17}/><span>Secure administrator access</span></div>
				</div>
				<div className="rail-bottom">SCHOLARK PORTAL <span>•</span> ADMIN</div>
			</div>
			<main className="login-main">
				<div className="login-card">
					<div className="login-icon"><LockKeyhole size={19}/></div>
					<p className="eyebrow">WELCOME BACK</p>
					<h2>Sign in to Admin</h2>
					<p className="login-subtitle">Use your ScholArk account to continue.</p>
					{status === 'forbidden' && <div className="form-message" role="alert">This account is signed in but is not provisioned as an administrator.</div>}
					{status === 'unavailable' && <div className="form-message" role="alert">The ScholArk API is unavailable. Check the connection and try again.</div>}
					{error && <div className="form-message" role="alert">{error}</div>}
					<form className="login-form" onSubmit={handleSubmit}>
						<label htmlFor="admin-email">Email address</label>
						<input autoComplete="username" id="admin-email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email}/>
						<label htmlFor="admin-password">Password</label>
						<input autoComplete="current-password" id="admin-password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password}/>
						<Button className="login-submit" disabled={isSubmitting} type="submit">
							{isSubmitting ? 'Signing in...' : 'Sign in'} <ArrowRight size={16}/>
						</Button>
					</form>
					<p className="login-footnote">Administrator access is managed separately from your ScholArk user account.</p>
				</div>
			</main>
		</div>
	);
}