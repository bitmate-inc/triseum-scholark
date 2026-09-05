import { ChangePasswordForm } from "../../../feature/auth/client/component/account-forms";
import { AccountPage } from "../../../feature/auth/shared/component/account-page";

export default function ChangePasswordPage() {
	return <AccountPage kicker="Account security" title="Change your password" description="Update the local credential used to access ScholArk."><ChangePasswordForm/></AccountPage>;
}