import { getTranslations } from "next-intl/server";

import { InstructorInvitationAcceptance } from "../../../../feature/auth/client/component/account-forms";
import { AccountPage } from "../../../../feature/auth/shared/component/account-page";

export default async function InstructorInvitationPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
	const t = await getTranslations("accountPages");
	const { token } = await searchParams;
	return <AccountPage kicker={t("instructorInvitation.kicker")} title={t("instructorInvitation.title")} description={t("instructorInvitation.description")}><InstructorInvitationAcceptance token={token}/></AccountPage>;
}