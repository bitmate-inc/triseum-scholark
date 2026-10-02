import { useTranslations } from "next-intl";

import { ForgotPasswordForm } from "../../../../feature/auth/client/component/account-forms";
import { AccountPage } from "../../../../feature/auth/shared/component/account-page";

export default function ForgotPasswordPage() {
	const t = useTranslations("accountPages");
	return <AccountPage kicker={t("forgotPassword.kicker")} title={t("forgotPassword.title")} description={t("forgotPassword.description")}><ForgotPasswordForm/></AccountPage>;
}