import { useTranslations } from "next-intl";

import { ProfileForm } from "../../../feature/auth/client/component/account-forms";
import { AccountPage } from "../../../feature/auth/shared/component/account-page";

export default function ProfilePage() {
	const t = useTranslations("accountPages");
	return <AccountPage kicker={t("profile.kicker")} title={t("profile.title")} description={t("profile.description")}><ProfileForm/></AccountPage>;
}