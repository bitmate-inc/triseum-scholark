import { ResetPasswordForm } from "../../../feature/auth/client/component/account-forms";
import { AccountPage } from "../../../feature/auth/shared/component/account-page";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
	const { token } = await searchParams;
	return <AccountPage kicker="Account recovery" title="Set a new password" description="Choose a fresh password to secure your portal account."><ResetPasswordForm token={token}/></AccountPage>;
}