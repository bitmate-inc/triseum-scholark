import { ForgotPasswordForm } from "../../../feature/auth/client/component/account-forms";
import { AccountPage } from "../../../feature/auth/shared/component/account-page";

export default function ForgotPasswordPage() {
	return <AccountPage kicker="Account recovery" title="Find your way back" description="Request a secure, single-use link to choose a new password."><ForgotPasswordForm/></AccountPage>;
}