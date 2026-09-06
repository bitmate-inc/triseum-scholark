import { buttonVariants } from "@repo/ui/button";
import { Menu, Search } from "lucide-react";
import Link from "next/link";

import styles from "../../../../asset/style/site.module.css";
import { AccountControl } from "../../../auth/client/component/account-control";

export function SiteHeader() {
	return (
		<header className={styles.siteHeader}>
			<Link className={styles.brand} href="/" aria-label="ScholArk home">
				<span className={styles.brandMark} aria-hidden="true">
					S
				</span>
				<span>ScholArk</span>
			</Link>
			<nav className={styles.primaryNav} aria-label="Primary navigation">
				<Link href="/catalog">Game Catalog</Link>
				<Link href="/institution">Educational Institutions</Link>
			</nav>
			<div className={styles.headerActions}>
				<Link
					className={buttonVariants({ variant: "ghost", size: "icon" })}
					href="/catalog"
					aria-label="Search games"
				>
					<Search/>
				</Link>
				<AccountControl/>
			</div>
			<div className={styles.mobileActions}>
				<Link
					className={buttonVariants({ variant: "ghost", size: "icon" })}
					href="/catalog"
					aria-label="Search games"
				>
					<Search/>
				</Link>
				<details className={styles.mobileMenu}>
					<summary aria-label="Open navigation menu">
						<Menu aria-hidden="true"/>
					</summary>
					<div className={styles.mobileMenuPanel}>
						<nav aria-label="Mobile navigation">
							<Link href="/catalog">Game Catalog</Link>
							<Link href="/institution">Institutions</Link>
						</nav>
						<div className={styles.mobileAccount}>
							<AccountControl/>
						</div>
					</div>
				</details>
			</div>
		</header>
	);
}