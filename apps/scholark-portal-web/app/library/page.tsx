import type { Metadata } from "next";

import styles from "../../asset/style/site.module.css";
import { LibraryView } from "../../feature/library/client/component/library-view";

export const metadata: Metadata = {
	description: "Your acquired ScholArk games, versions, and classroom assignments.",
	title: "Your library · ScholArk",
};

export default function LibraryPage() {
	return (
		<main className={styles.catalogPage}>
			<header className={styles.catalogIntro}>
				<p className={styles.kicker}>Your library</p>
				<h1>Every experience, accounted for.</h1>
				<p>Keep track of your standalone games, classroom assignments, exact publisher versions, and custom content.</p>
			</header>
			<LibraryView/>
		</main>
	);
}