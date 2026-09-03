import { ConfirmEmail } from "../../../feature/auth/client/component/account-forms";
import { AccountPage } from "../../../feature/auth/shared/component/account-page";

export default async function ConfirmEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
	const { token } = await searchParams;
	return <AccountPage kicker="Account security" title="Email confirmation" description="This single-use link activates your ScholArk account."><ConfirmEmail token={token}/></AccountPage>;
}