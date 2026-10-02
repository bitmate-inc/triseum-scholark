import { useTranslations } from "next-intl";

import { ChangePasswordForm } from "../../../../feature/auth/client/component/account-forms";
import { AccountPage } from "../../../../feature/auth/shared/component/account-page";

export default function ChangePasswordPage() {
	const t = useTranslations("accountPages");
	return <AccountPage kicker={t("changePassword.kicker")} title={t("changePassword.title")} description={t("changePassword.description")}><ChangePasswordForm/></AccountPage>;
}