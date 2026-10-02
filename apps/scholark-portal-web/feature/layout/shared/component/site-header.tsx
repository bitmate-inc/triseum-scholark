import { buttonVariants } from "@repo/ui/button";
import { Menu, Search } from "lucide-react";
import { useTranslations } from "next-intl";

import styles from "../../../../asset/style/site.module.css";
import { Link } from "../../../../i18n/navigation";
import { AccountControl } from "../../../auth/client/component/account-control";
import { LocaleSwitcher } from "./locale-switcher";

export function SiteHeader() {
	const t = useTranslations("navigation");

	return (
		<header className={styles.siteHeader}>
			<Link className={styles.brand} href="/" aria-label={t("home")}>
				<span className={styles.brandMark} aria-hidden="true">
					S
				</span>
				<span>ScholArk</span>
			</Link>
			<nav className={styles.primaryNav} aria-label={t("primaryNavigation")}>
				<Link href="/catalog">{t("catalog")}</Link>
				<Link href="/institution">{t("institutions")}</Link>
			</nav>
			<div className={styles.headerActions}>
				<Link
					className={buttonVariants({ variant: "ghost", size: "icon" })}
					href="/catalog"
					aria-label={t("searchGames")}
				>
					<Search/>
				</Link>
				<LocaleSwitcher/>
				<AccountControl/>
			</div>
			<div className={styles.mobileActions}>
				<Link
					className={buttonVariants({ variant: "ghost", size: "icon" })}
					href="/catalog"
					aria-label={t("searchGames")}
				>
					<Search/>
				</Link>
				<details className={styles.mobileMenu}>
					<summary aria-label={t("openMenu")}>
						<Menu aria-hidden="true"/>
					</summary>
					<div className={styles.mobileMenuPanel}>
						<nav aria-label={t("mobileNavigation")}>
							<Link href="/catalog">{t("catalog")}</Link>
							<Link href="/institution">{t("institutions")}</Link>
						</nav>
						<LocaleSwitcher/>
						<div className={styles.mobileAccount}>
							<AccountControl/>
						</div>
					</div>
				</details>
			</div>
		</header>
	);
}