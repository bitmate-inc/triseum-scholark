import styles from "../../asset/style/site.module.css";
import { LibraryView } from "../../feature/library/client/component/library-view";
import { ProtectedLibrary } from "../../feature/library/client/component/protected-library";

type LibraryMode = "classroom" | "standalone";

export function LibraryPageContent({ mode }: { mode: LibraryMode }) {
	const isClassroom = mode === "classroom";
	const title = isClassroom ? "Your classroom games." : "Your standalone games.";
	const description = isClassroom
		? "Follow assigned games, access windows, and your progress in each classroom."
		: "Run and manage games you acquired outside a classroom.";

	return (
		<main className={styles.catalogPage}>
			<header className={styles.catalogIntro}>
				<p className={styles.kicker}>Your library</p>
				<h1>{title}</h1>
				<p>{description}</p>
			</header>
			<ProtectedLibrary><LibraryView mode={mode}/></ProtectedLibrary>
		</main>
	);
}