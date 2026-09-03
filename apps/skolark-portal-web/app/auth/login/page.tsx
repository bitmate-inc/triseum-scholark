import { LoginForm } from "../../../feature/auth/client/component/account-forms";
import { AccountPage } from "../../../feature/auth/shared/component/account-page";

export default function LoginPage() {
	return <AccountPage kicker="Your account" title="Welcome back" description="Return to your learning library and account settings."><LoginForm/></AccountPage>;
}