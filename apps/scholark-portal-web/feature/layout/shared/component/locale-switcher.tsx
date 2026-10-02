"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import styles from "../../../../asset/style/site.module.css";
import { Link, usePathname } from "../../../../i18n/navigation";

export function LocaleSwitcher() {
	const locale = useLocale();
	const pathname = usePathname();
	const t = useTranslations("navigation");
	const targetLocale = locale === "en" ? "es" : "en";
	const targetLanguage = locale === "en" ? t("spanish") : t("english");
	const label = locale === "en" ? t("switchToSpanish") : t("switchToEnglish");

	return (
		<Link className={styles.languageSwitch} href={pathname} locale={targetLocale} aria-label={label}>
			<Languages aria-hidden="true"/>
			<span>{targetLanguage}</span>
		</Link>
	);
}