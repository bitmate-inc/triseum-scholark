import { RegisterForm } from "../../../feature/auth/client/component/account-forms";
import { AccountPage } from "../../../feature/auth/shared/component/account-page";

export default function RegisterPage() {
	return <AccountPage kicker="Join ScholArk" title="Create an account" description="One portal identity for your games, progress, and profile."><RegisterForm/></AccountPage>;
}