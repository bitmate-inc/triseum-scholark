"use client";

import {
	Alert,
	AlertDescription,
	AlertTitle
} from "@repo/ui/alert";
import { Button } from "@repo/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel
} from "@repo/ui/field";
import { Input } from "@repo/ui/input";
import {
	AlertCircle,
	CheckCircle2,
	LoaderCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	type FormEvent,
	type ReactNode,
	useEffect,
	useRef,
	useState
} from "react";

import styles from "../../../../asset/style/account.module.css";
import {
	useAuthConfirmEmailMutation,
	useAuthLoginMutation,
	useAuthRegisterMutation,
	useAuthRequestPasswordResetMutation,
	useAuthResendVerificationMutation,
	useAuthResetPasswordMutation,
	useUserChangePasswordMutation,
	useUserGetOwnUserQuery,
	useUserUpdateProfileMutation,
} from "../../../api/client/api/generated-api";
import { getApiErrorMessage } from "../lib/api-error";

function FormCard({ children, description, footer, title }: {
	children: ReactNode;
	description: string;
	footer?: ReactNode;
	title: string;
}) {
	return (
		<Card className={styles.formCard}>
			<CardHeader>
				<CardTitle className={styles.formTitle}>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent>{children}</CardContent>
			{footer ? <CardFooter className={styles.formFooter}>{footer}</CardFooter> : null}
		</Card>
	);
}

function Feedback({ error, success }: { error?: unknown; success?: string }) {
	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircle/>
				<AlertTitle>Unable to continue</AlertTitle>
				<AlertDescription>{getApiErrorMessage(error)}</AlertDescription>
			</Alert>
		);
	}

	if (success) {
		return (
			<Alert>
				<CheckCircle2/>
				<AlertTitle>Done</AlertTitle>
				<AlertDescription>{success}</AlertDescription>
			</Alert>
		);
	}

	return null;
}

function SubmitButton({ children, pending }: { children: ReactNode; pending: boolean }) {
	return (
		<Button disabled={pending} type="submit">
			{pending ? <LoaderCircle className="animate-spin" data-icon="inline-start"/> : null}
			{children}
		</Button>
	);
}

function isUnauthorized(error: unknown): boolean {
	return typeof error === "object" && error !== null && "status" in error && error.status === 401;
}

export function LoginForm() {
	const [login, result] = useAuthLoginMutation();

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const response = await login({
			loginRequestDto: {
				email: String(data.get("email")),
				password: String(data.get("password")),
			} 
		});
		if ("data" in response) window.location.assign("/profile");
	}

	return (
		<FormCard
			title="Sign in"
			description="Use your confirmed email address and password."
			footer={<><Link href="/auth/register">Create account</Link><Link href="/auth/forgot-password">Forgot password?</Link></>}
		>
			<form onSubmit={submit}>
				<FieldGroup>
					<Feedback error={result.error}/>
					<Field>
						<FieldLabel htmlFor="email">Email</FieldLabel>
						<Input autoComplete="email" id="email" name="email" required type="email"/>
					</Field>
					<Field>
						<FieldLabel htmlFor="password">Password</FieldLabel>
						<Input autoComplete="current-password" id="password" minLength={8} name="password" required type="password"/>
					</Field>
					<SubmitButton pending={result.isLoading}>Sign in</SubmitButton>
				</FieldGroup>
			</form>
		</FormCard>
	);
}

export function RegisterForm() {
	const [register, result] = useAuthRegisterMutation();
	const [formError, setFormError] = useState<string>();

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError(undefined);
		const data = new FormData(event.currentTarget);
		const password = String(data.get("password"));

		if (password !== String(data.get("confirmPassword"))) {
			setFormError("Passwords do not match.");
			return;
		}

		await register({
			registerRequestDto: {
				email: String(data.get("email")),
				firstName: String(data.get("firstName")),
				lastName: String(data.get("lastName")),
				password,
			} 
		});
	}

	return (
		<FormCard title="Create your account" description="Your account becomes active after email confirmation." footer={<Link href="/auth/login">Already have an account?</Link>}>
			{result.isSuccess ? (
				<Feedback success="Check your inbox for the confirmation link, then return to sign in."/>
			) : (
				<form onSubmit={submit}>
					<FieldGroup>
						<Feedback error={result.error}/>
						{formError ? <FieldError>{formError}</FieldError> : null}
						<Field><FieldLabel htmlFor="firstName">First name</FieldLabel><Input autoComplete="given-name" id="firstName" name="firstName" required/></Field>
						<Field><FieldLabel htmlFor="lastName">Last name</FieldLabel><Input autoComplete="family-name" id="lastName" name="lastName" required/></Field>
						<Field><FieldLabel htmlFor="email">Email</FieldLabel><Input autoComplete="email" id="email" name="email" required type="email"/></Field>
						<Field><FieldLabel htmlFor="password">Password</FieldLabel><Input autoComplete="new-password" id="password" minLength={8} name="password" required type="password"/><FieldDescription>Use at least 8 characters.</FieldDescription></Field>
						<Field><FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel><Input autoComplete="new-password" id="confirmPassword" minLength={8} name="confirmPassword" required type="password"/></Field>
						<SubmitButton pending={result.isLoading}>Create account</SubmitButton>
					</FieldGroup>
				</form>
			)}
		</FormCard>
	);
}

export function VerifyEmailForm() {
	const [resend, result] = useAuthResendVerificationMutation();

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		await resend({ emailRequestDto: { email: String(data.get("email")) } });
	}

	return (
		<FormCard title="Resend confirmation" description="Enter your email and we will issue a fresh confirmation link." footer={<Link href="/auth/login">Back to sign in</Link>}>
			<form onSubmit={submit}>
				<FieldGroup>
					<Feedback error={result.error} success={result.data?.message}/>
					<Field><FieldLabel htmlFor="email">Email</FieldLabel><Input autoComplete="email" id="email" name="email" required type="email"/></Field>
					<SubmitButton pending={result.isLoading}>Send confirmation</SubmitButton>
				</FieldGroup>
			</form>
		</FormCard>
	);
}

export function ConfirmEmail({ token }: { token?: string }) {
	const [confirm, result] = useAuthConfirmEmailMutation();
	const started = useRef(false);

	useEffect(() => {
		if (!token || started.current) return;
		started.current = true;
		void confirm({ tokenRequestDto: { token } });
	}, [confirm, token]);

	return (
		<FormCard title="Confirm your email" description="We are validating your confirmation link." footer={<Link href="/auth/login">Continue to sign in</Link>}>
			{!token ? <Feedback error={{ status: 400, data: { message: "The confirmation link is missing its token." } }}/> : null}
			{result.isLoading || (!result.isSuccess && !result.error && token) ? <p>Confirming your email address...</p> : null}
			<Feedback error={result.error} success={result.data?.message}/>
		</FormCard>
	);
}

export function ForgotPasswordForm() {
	const [requestReset, result] = useAuthRequestPasswordResetMutation();

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		await requestReset({ emailRequestDto: { email: String(data.get("email")) } });
	}

	return (
		<FormCard title="Reset your password" description="We will email a single-use reset link if the account exists." footer={<Link href="/auth/login">Back to sign in</Link>}>
			<form onSubmit={submit}>
				<FieldGroup>
					<Feedback error={result.error} success={result.data?.message}/>
					<Field><FieldLabel htmlFor="email">Email</FieldLabel><Input autoComplete="email" id="email" name="email" required type="email"/></Field>
					<SubmitButton pending={result.isLoading}>Send reset link</SubmitButton>
				</FieldGroup>
			</form>
		</FormCard>
	);
}

export function ResetPasswordForm({ token }: { token?: string }) {
	const [resetPassword, result] = useAuthResetPasswordMutation();
	const [formError, setFormError] = useState<string>();

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError(undefined);
		const data = new FormData(event.currentTarget);
		const password = String(data.get("password"));
		if (password !== String(data.get("confirmPassword"))) {
			setFormError("Passwords do not match.");
			return;
		}
		await resetPassword({ resetPasswordRequestDto: { password, token: token! } });
	}

	return (
		<FormCard title="Choose a new password" description="Using this link will revoke existing sessions." footer={<Link href="/auth/login">Back to sign in</Link>}>
			{result.isSuccess ? <Feedback success="Your password has been updated. You can now sign in."/> : (
				<form onSubmit={submit}>
					<FieldGroup>
						{!token ? <FieldError>The reset link is missing its token.</FieldError> : null}
						<Feedback error={result.error}/>
						{formError ? <FieldError>{formError}</FieldError> : null}
						<Field><FieldLabel htmlFor="password">New password</FieldLabel><Input autoComplete="new-password" id="password" minLength={8} name="password" required type="password"/></Field>
						<Field><FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel><Input autoComplete="new-password" id="confirmPassword" minLength={8} name="confirmPassword" required type="password"/></Field>
						<SubmitButton pending={result.isLoading || !token}>Update password</SubmitButton>
					</FieldGroup>
				</form>
			)}
		</FormCard>
	);
}

export function ProfileForm() {
	const router = useRouter();
	const user = useUserGetOwnUserQuery();
	const [updateProfile, update] = useUserUpdateProfileMutation();

	useEffect(() => {
		if (isUnauthorized(user.error)) router.replace("/auth/login");
	}, [router, user.error]);

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		await updateProfile({
			updateProfileRequestDto: {
				firstName: String(data.get("firstName")),
				lastName: String(data.get("lastName")),
			} 
		});
	}

	return (
		<FormCard title="Your profile" description="Manage the personal details attached to your account." footer={<Link href="/profile/password">Change password</Link>}>
			{user.isLoading ? <p>Loading your profile...</p> : null}
			{user.data ? (
				<form onSubmit={submit}>
					<FieldGroup>
						<Feedback error={update.error} success={update.isSuccess ? "Your profile has been updated." : undefined}/>
						<p className={styles.profileMeta}>{user.data.email}</p>
						<Field><FieldLabel htmlFor="firstName">First name</FieldLabel><Input defaultValue={user.data.firstName ?? ""} id="firstName" name="firstName" required/></Field>
						<Field><FieldLabel htmlFor="lastName">Last name</FieldLabel><Input defaultValue={user.data.lastName ?? ""} id="lastName" name="lastName" required/></Field>
						<SubmitButton pending={update.isLoading}>Save profile</SubmitButton>
					</FieldGroup>
				</form>
			) : null}
		</FormCard>
	);
}

export function ChangePasswordForm() {
	const router = useRouter();
	const user = useUserGetOwnUserQuery();
	const [changePassword, result] = useUserChangePasswordMutation();
	const [formError, setFormError] = useState<string>();

	useEffect(() => {
		if (isUnauthorized(user.error)) router.replace("/auth/login");
	}, [router, user.error]);

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError(undefined);
		const data = new FormData(event.currentTarget);
		const password = String(data.get("password"));
		if (password !== String(data.get("confirmPassword"))) {
			setFormError("Passwords do not match.");
			return;
		}
		await changePassword({
			changePasswordRequestDto: {
				currentPassword: String(data.get("currentPassword")),
				password,
			} 
		});
	}

	return (
		<FormCard title="Change password" description="Confirm your current password before choosing a new one." footer={<Link href="/profile">Back to profile</Link>}>
			{user.data ? (
				<form onSubmit={submit}>
					<FieldGroup>
						<Feedback error={result.error} success={result.data?.message}/>
						{formError ? <FieldError>{formError}</FieldError> : null}
						<Field><FieldLabel htmlFor="currentPassword">Current password</FieldLabel><Input autoComplete="current-password" id="currentPassword" name="currentPassword" required type="password"/></Field>
						<Field><FieldLabel htmlFor="password">New password</FieldLabel><Input autoComplete="new-password" id="password" minLength={8} name="password" required type="password"/></Field>
						<Field><FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel><Input autoComplete="new-password" id="confirmPassword" minLength={8} name="confirmPassword" required type="password"/></Field>
						<SubmitButton pending={result.isLoading}>Update password</SubmitButton>
					</FieldGroup>
				</form>
			) : <p>Loading your account...</p>}
		</FormCard>
	);
}