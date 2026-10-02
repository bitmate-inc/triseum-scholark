import { getTranslations } from "next-intl/server";

import { ConfirmEmail } from "../../../../feature/auth/client/component/account-forms";
import { AccountPage } from "../../../../feature/auth/shared/component/account-page";

export default async function ConfirmEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
	const t = await getTranslations("accountPages");
	const { token } = await searchParams;
	return <AccountPage kicker={t("confirmEmail.kicker")} title={t("confirmEmail.title")} description={t("confirmEmail.description")}><ConfirmEmail token={token}/></AccountPage>;
}