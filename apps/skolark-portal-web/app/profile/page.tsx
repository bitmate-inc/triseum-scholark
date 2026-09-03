import { ProfileForm } from "../../feature/auth/client/component/account-forms";
import { AccountPage } from "../../feature/auth/shared/component/account-page";

export default function ProfilePage() {
	return <AccountPage kicker="Account settings" title="Your profile" description="Keep the identity attached to your ScholArk activity current."><ProfileForm/></AccountPage>;
}