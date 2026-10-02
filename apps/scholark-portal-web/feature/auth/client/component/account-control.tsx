"use client";

import { Button, buttonVariants } from "@repo/ui/button";
import {
	CreditCard,
	LogOut,
	UserRound
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { getPathname, Link } from "../../../../i18n/navigation";
import { useAuthGetSessionQuery, useAuthLogoutMutation } from "../../../api/client/api/generated-api";

export function AccountControl() {
	const locale = useLocale();
	const t = useTranslations("account");
	const user = useAuthGetSessionQuery();
	const [logout, logoutResult] = useAuthLogoutMutation();

	async function signOut() {
		const response = await logout();
		if ("data" in response) window.location.assign(getPathname({ locale, href: "/" }));
	}

	if (!user.data) {
		return (
			<Link className={buttonVariants({ variant: "outline", size: "sm" })} href="/auth/login">
				<UserRound data-icon="inline-start"/>
				{t("signIn")}
			</Link>
		);
	}

	return (
		<>
			<Link className={buttonVariants({ variant: "ghost", size: "sm" })} href="/library">
				{t("library")}
			</Link>
			<Link className={buttonVariants({ variant: "ghost", size: "sm" })} href="/billing">
				<CreditCard data-icon="inline-start"/>
				{t("billing")}
			</Link>
			<Link className={buttonVariants({ variant: "outline", size: "sm" })} href="/profile">
				<UserRound data-icon="inline-start"/>
				{t("profile")}
			</Link>
			<Button aria-label={t("signOut")} disabled={logoutResult.isLoading} onClick={signOut} size="icon" variant="ghost">
				<LogOut/>
			</Button>
		</>
	);
}