import { useTranslations } from "next-intl";

import { VerifyEmailForm } from "../../../../feature/auth/client/component/account-forms";
import { AccountPage } from "../../../../feature/auth/shared/component/account-page";

export default function VerifyEmailPage() {
	const t = useTranslations("accountPages");
	return <AccountPage kicker={t("verifyEmail.kicker")} title={t("verifyEmail.title")} description={t("verifyEmail.description")}><VerifyEmailForm/></AccountPage>;
}