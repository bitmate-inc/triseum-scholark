import { useTranslations } from "next-intl";

import { RegisterForm } from "../../../../feature/auth/client/component/account-forms";
import { AccountPage } from "../../../../feature/auth/shared/component/account-page";

export default function RegisterPage() {
	const t = useTranslations("accountPages");
	return <AccountPage kicker={t("register.kicker")} title={t("register.title")} description={t("register.description")}><RegisterForm/></AccountPage>;
}