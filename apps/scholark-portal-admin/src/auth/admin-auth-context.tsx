import {
	createContext,
	type FormEvent,
	type ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';

export interface AdminUser {
	email: string;
	firstName?: string;
	id: string;
	lastName?: string;
}

type AuthStatus = 'checking' | 'signed-out' | 'forbidden' | 'unavailable' | 'signed-in';

interface AdminAuthContextValue {
	login: (email: string, password: string) => Promise<string | undefined>;
	logout: () => Promise<void>;
	status: AuthStatus;
	user?: AdminUser;
}

const apiBase = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
	const [status, setStatus] = useState<AuthStatus>('checking');
	const [user, setUser] = useState<AdminUser>();
	const requestSequence = useRef(0);

	useEffect(() => {
		const controller = new AbortController();
		const requestId = ++requestSequence.current;
		fetch(`${apiBase}/admin/session`, { credentials: 'include', signal: controller.signal })
			.then(async (response) => {
				if (requestId !== requestSequence.current) {
					return;
				}
				if (response.status === 401) {
					setStatus('signed-out');
					return;
				}
				if (response.status === 403) {
					setStatus('forbidden');
					return;
				}
				if (!response.ok) {
					throw new Error('Admin session could not be verified.');
				}

				setUser(await response.json() as AdminUser);
				setStatus('signed-in');
			})
			.catch((error: unknown) => {
				if (requestId !== requestSequence.current) {
					return;
				}
				if (error instanceof DOMException && error.name === 'AbortError') {
					return;
				}
				setStatus('unavailable');
			});

		return () => controller.abort();
	}, []);

	async function login(email: string, password: string): Promise<string | undefined> {
		requestSequence.current++;
		setStatus('checking');
		try {
			const response = await fetch(`${apiBase}/auth/login`, {
				body: JSON.stringify({ email, password }),
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				method: 'POST',
			});
			if (!response.ok) {
				setStatus('signed-out');
				return 'Those credentials could not be verified.';
			}

			const sessionResponse = await fetch(`${apiBase}/admin/session`, { credentials: 'include' });
			if (sessionResponse.status === 403) {
				setStatus('forbidden');
				return 'This account does not have administrator access.';
			}
			if (!sessionResponse.ok) {
				setStatus('signed-out');
				return 'The administrator session could not be started.';
			}

			setUser(await sessionResponse.json() as AdminUser);
			setStatus('signed-in');
			return undefined;
		} catch {
			setStatus('unavailable');
			return 'The ScholArk API could not be reached.';
		}
	}

	async function logout(): Promise<void> {
		requestSequence.current++;
		try {
			await fetch(`${apiBase}/auth/logout`, { credentials: 'include', method: 'POST' });
		} finally {
			setUser(undefined);
			setStatus('signed-out');
		}
	}

	return (
		<AdminAuthContext.Provider value={{ login, logout, status, user }}>
			{children}
		</AdminAuthContext.Provider>
	);
}

export function useAdminAuth(): AdminAuthContextValue {
	const context = useContext(AdminAuthContext);
	if (!context) {
		throw new Error('useAdminAuth must be used within AdminAuthProvider.');
	}

	return context;
}

export function preventLoginSubmit(event: FormEvent<HTMLFormElement>): void {
	event.preventDefault();
}