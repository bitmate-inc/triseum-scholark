import { VerifyEmailForm } from "../../../feature/auth/client/component/account-forms";
import { AccountPage } from "../../../feature/auth/shared/component/account-page";

export default function VerifyEmailPage() {
	return <AccountPage kicker="Account security" title="Verify your email" description="Email confirmation protects your portal identity before the first sign-in."><VerifyEmailForm/></AccountPage>;
}