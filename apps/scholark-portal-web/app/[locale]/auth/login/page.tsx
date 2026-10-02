import { getTranslations } from "next-intl/server";

import { LoginForm } from "../../../../feature/auth/client/component/account-forms";
import { AccountPage } from "../../../../feature/auth/shared/component/account-page";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ backTo?: string }> }) {
	const t = await getTranslations("accountPages");
	const { backTo } = await searchParams;
	const redirectPath = backTo?.startsWith("/") && !backTo.startsWith("//") ? backTo : undefined;

	return <AccountPage kicker={t("login.kicker")} title={t("login.title")} description={t("login.description")}><LoginForm backTo={redirectPath}/></AccountPage>;
}