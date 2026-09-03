import type { ReactNode } from "react";

import styles from "../../../../asset/style/account.module.css";

interface AccountPageProps {
	children: ReactNode;
	kicker: string;
	title: string;
	description: string;
}

export function AccountPage({ children, kicker, title, description }: AccountPageProps) {
	return (
		<main className={styles.accountPage}>
			<section className={styles.accountIntro}>
				<p>{kicker}</p>
				<h1>{title}</h1>
				<p>{description}</p>
			</section>
			<div className={styles.accountPanel}>{children}</div>
		</main>
	);
}