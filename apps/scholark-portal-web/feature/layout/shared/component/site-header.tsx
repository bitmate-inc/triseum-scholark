import { buttonVariants } from "@repo/ui/button";
import { BookOpen, Search } from "lucide-react";
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
				<Link href="/catalog">Games</Link>
				<Link href="/institution">Institutions</Link>
			</nav>
			<div className={styles.headerActions}>
				<Link
					className={buttonVariants({ variant: "ghost", size: "icon" })}
					href="/catalog"
					aria-label="Search games"
				>
					<Search/>
				</Link>
				<button
					className={buttonVariants({ variant: "ghost", size: "icon" })}
					aria-label="Choose language"
					type="button"
				>
					<BookOpen/>
				</button>
				<AccountControl/>
			</div>
		</header>
	);
}