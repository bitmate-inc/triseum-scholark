import { LoginForm } from "../../../feature/auth/client/component/account-forms";
import { AccountPage } from "../../../feature/auth/shared/component/account-page";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ backTo?: string }> }) {
	const { backTo } = await searchParams;
	const redirectPath = backTo?.startsWith("/") && !backTo.startsWith("//") ? backTo : undefined;

	return <AccountPage kicker="Your account" title="Welcome back" description="Return to your learning library and account settings."><LoginForm backTo={redirectPath}/></AccountPage>;
}