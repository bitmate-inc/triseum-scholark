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
import { useLocale, useTranslations } from "next-intl";
import {
	type FormEvent,
	type ReactNode,
	useEffect,
	useRef,
	useState
} from "react";

import styles from "../../../../asset/style/account.module.css";
import {
	getPathname,
	Link,
	useRouter
} from "../../../../i18n/navigation";
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
	const t = useTranslations("auth");

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircle/>
				<AlertTitle>{t("unableToContinue")}</AlertTitle>
				<AlertDescription>{getApiErrorMessage(error, { generic: t("genericApiError"), request: t("requestApiError") })}</AlertDescription>
			</Alert>
		);
	}

	if (success) {
		return (
			<Alert>
				<CheckCircle2/>
				<AlertTitle>{t("done")}</AlertTitle>
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

export function LoginForm({ backTo }: { backTo?: string }) {
	const locale = useLocale();
	const t = useTranslations("auth");
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
		if ("data" in response) {
			window.location.assign(getPathname({ locale, href: backTo ?? "/library" }));
		}
	}

	return (
		<FormCard
			title={t("signInTitle")}
			description={t("signInDescription")}
			footer={<><Link href="/auth/register">{t("createAccount")}</Link><Link href="/auth/forgot-password">{t("forgotPassword")}</Link></>}
		>
			<form onSubmit={submit}>
				<FieldGroup>
					<Feedback error={result.error}/>
					<Field>
						<FieldLabel htmlFor="email">{t("email")}</FieldLabel>
						<Input autoComplete="email" id="email" name="email" required type="email"/>
					</Field>
					<Field>
						<FieldLabel htmlFor="password">{t("password")}</FieldLabel>
						<Input autoComplete="current-password" id="password" minLength={8} name="password" required type="password"/>
					</Field>
					<SubmitButton pending={result.isLoading}>{t("signIn")}</SubmitButton>
				</FieldGroup>
			</form>
		</FormCard>
	);
}

export function RegisterForm() {
	const t = useTranslations("auth");
	const [register, result] = useAuthRegisterMutation();
	const [formError, setFormError] = useState<string>();

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError(undefined);
		const data = new FormData(event.currentTarget);
		const password = String(data.get("password"));

		if (password !== String(data.get("confirmPassword"))) {
			setFormError(t("passwordMismatch"));
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
		<FormCard title={t("registerTitle")} description={t("registerDescription")} footer={<Link href="/auth/login">{t("alreadyHaveAccount")}</Link>}>
			{result.isSuccess ? (
				<Feedback success={t("registrationSuccess")}/>
			) : (
				<form onSubmit={submit}>
					<FieldGroup>
						<Feedback error={result.error}/>
						{formError ? <FieldError>{formError}</FieldError> : null}
						<Field><FieldLabel htmlFor="firstName">{t("firstName")}</FieldLabel><Input autoComplete="given-name" id="firstName" name="firstName" required/></Field>
						<Field><FieldLabel htmlFor="lastName">{t("lastName")}</FieldLabel><Input autoComplete="family-name" id="lastName" name="lastName" required/></Field>
						<Field><FieldLabel htmlFor="email">{t("email")}</FieldLabel><Input autoComplete="email" id="email" name="email" required type="email"/></Field>
						<Field><FieldLabel htmlFor="password">{t("password")}</FieldLabel><Input autoComplete="new-password" id="password" minLength={8} name="password" required type="password"/><FieldDescription>{t("passwordHint")}</FieldDescription></Field>
						<Field><FieldLabel htmlFor="confirmPassword">{t("confirmPassword")}</FieldLabel><Input autoComplete="new-password" id="confirmPassword" minLength={8} name="confirmPassword" required type="password"/></Field>
						<SubmitButton pending={result.isLoading}>{t("createAccount")}</SubmitButton>
					</FieldGroup>
				</form>
			)}
		</FormCard>
	);
}

export function VerifyEmailForm() {
	const t = useTranslations("auth");
	const [resend, result] = useAuthResendVerificationMutation();

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		await resend({ emailRequestDto: { email: String(data.get("email")) } });
	}

	return (
		<FormCard title={t("resendConfirmationTitle")} description={t("resendConfirmationDescription")} footer={<Link href="/auth/login">{t("backToSignIn")}</Link>}>
			<form onSubmit={submit}>
				<FieldGroup>
					<Feedback error={result.error} success={result.data?.message}/>
					<Field><FieldLabel htmlFor="email">{t("email")}</FieldLabel><Input autoComplete="email" id="email" name="email" required type="email"/></Field>
					<SubmitButton pending={result.isLoading}>{t("sendConfirmation")}</SubmitButton>
				</FieldGroup>
			</form>
		</FormCard>
	);
}

export function ConfirmEmail({ token }: { token?: string }) {
	const t = useTranslations("auth");
	const [confirm, result] = useAuthConfirmEmailMutation();
	const started = useRef(false);

	useEffect(() => {
		if (!token || started.current) return;
		started.current = true;
		void confirm({ tokenRequestDto: { token } });
	}, [confirm, token]);

	return (
		<FormCard title={t("confirmEmailTitle")} description={t("confirmEmailDescription")} footer={<Link href="/auth/login">{t("continueToSignIn")}</Link>}>
			{!token ? <Feedback error={{ status: 400, data: { message: t("missingConfirmationToken") } }}/> : null}
			{result.isLoading || (!result.isSuccess && !result.error && token) ? <p>{t("confirmingEmail")}</p> : null}
			<Feedback error={result.error} success={result.data?.message}/>
		</FormCard>
	);
}

export function ForgotPasswordForm() {
	const t = useTranslations("auth");
	const [requestReset, result] = useAuthRequestPasswordResetMutation();

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		await requestReset({ emailRequestDto: { email: String(data.get("email")) } });
	}

	return (
		<FormCard title={t("forgotPasswordTitle")} description={t("forgotPasswordDescription")} footer={<Link href="/auth/login">{t("backToSignIn")}</Link>}>
			<form onSubmit={submit}>
				<FieldGroup>
					<Feedback error={result.error} success={result.data?.message}/>
					<Field><FieldLabel htmlFor="email">{t("email")}</FieldLabel><Input autoComplete="email" id="email" name="email" required type="email"/></Field>
					<SubmitButton pending={result.isLoading}>{t("sendResetLink")}</SubmitButton>
				</FieldGroup>
			</form>
		</FormCard>
	);
}

export function ResetPasswordForm({ token }: { token?: string }) {
	const t = useTranslations("auth");
	const [resetPassword, result] = useAuthResetPasswordMutation();
	const [formError, setFormError] = useState<string>();

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError(undefined);
		const data = new FormData(event.currentTarget);
		const password = String(data.get("password"));
		if (password !== String(data.get("confirmPassword"))) {
			setFormError(t("passwordMismatch"));
			return;
		}
		await resetPassword({ resetPasswordRequestDto: { password, token: token! } });
	}

	return (
		<FormCard title={t("choosePasswordTitle")} description={t("choosePasswordDescription")} footer={<Link href="/auth/login">{t("backToSignIn")}</Link>}>
			{result.isSuccess ? <Feedback success={t("passwordUpdated")}/> : (
				<form onSubmit={submit}>
					<FieldGroup>
						{!token ? <FieldError>{t("missingResetToken")}</FieldError> : null}
						<Feedback error={result.error}/>
						{formError ? <FieldError>{formError}</FieldError> : null}
						<Field><FieldLabel htmlFor="password">{t("newPassword")}</FieldLabel><Input autoComplete="new-password" id="password" minLength={8} name="password" required type="password"/></Field>
						<Field><FieldLabel htmlFor="confirmPassword">{t("confirmPassword")}</FieldLabel><Input autoComplete="new-password" id="confirmPassword" minLength={8} name="confirmPassword" required type="password"/></Field>
						<SubmitButton pending={result.isLoading || !token}>{t("updatePassword")}</SubmitButton>
					</FieldGroup>
				</form>
			)}
		</FormCard>
	);
}

export function ProfileForm() {
	const t = useTranslations("auth");
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
		<FormCard title={t("profileTitle")} description={t("profileDescription")} footer={<Link href="/profile/password">{t("changePassword")}</Link>}>
			{user.isLoading ? <p>{t("loadingProfile")}</p> : null}
			{user.data ? (
				<form onSubmit={submit}>
					<FieldGroup>
						<Feedback error={update.error} success={update.isSuccess ? t("profileUpdated") : undefined}/>
						<p className={styles.profileMeta}>{user.data.email}</p>
						<Field><FieldLabel htmlFor="firstName">{t("firstName")}</FieldLabel><Input defaultValue={user.data.firstName ?? ""} id="firstName" name="firstName" required/></Field>
						<Field><FieldLabel htmlFor="lastName">{t("lastName")}</FieldLabel><Input defaultValue={user.data.lastName ?? ""} id="lastName" name="lastName" required/></Field>
						<SubmitButton pending={update.isLoading}>{t("saveProfile")}</SubmitButton>
					</FieldGroup>
				</form>
			) : null}
		</FormCard>
	);
}

export function ChangePasswordForm() {
	const t = useTranslations("auth");
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
			setFormError(t("passwordMismatch"));
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
		<FormCard title={t("changePasswordTitle")} description={t("changePasswordDescription")} footer={<Link href="/profile">{t("backToProfile")}</Link>}>
			{user.data ? (
				<form onSubmit={submit}>
					<FieldGroup>
						<Feedback error={result.error} success={result.data?.message}/>
						{formError ? <FieldError>{formError}</FieldError> : null}
						<Field><FieldLabel htmlFor="currentPassword">{t("currentPassword")}</FieldLabel><Input autoComplete="current-password" id="currentPassword" name="currentPassword" required type="password"/></Field>
						<Field><FieldLabel htmlFor="password">{t("newPassword")}</FieldLabel><Input autoComplete="new-password" id="password" minLength={8} name="password" required type="password"/></Field>
						<Field><FieldLabel htmlFor="confirmPassword">{t("confirmNewPassword")}</FieldLabel><Input autoComplete="new-password" id="confirmPassword" minLength={8} name="confirmPassword" required type="password"/></Field>
						<SubmitButton pending={result.isLoading}>{t("updatePassword")}</SubmitButton>
					</FieldGroup>
				</form>
			) : <p>{t("loadingAccount")}</p>}
		</FormCard>
	);
}