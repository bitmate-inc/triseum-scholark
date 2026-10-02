import { getTranslations } from "next-intl/server";

import { ResetPasswordForm } from "../../../../feature/auth/client/component/account-forms";
import { AccountPage } from "../../../../feature/auth/shared/component/account-page";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
	const t = await getTranslations("accountPages");
	const { token } = await searchParams;
	return <AccountPage kicker={t("resetPassword.kicker")} title={t("resetPassword.title")} description={t("resetPassword.description")}><ResetPasswordForm token={token}/></AccountPage>;
}