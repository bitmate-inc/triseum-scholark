import { useTranslations } from "next-intl";

import styles from "../../../asset/style/site.module.css";
import { LibraryView } from "../../../feature/library/client/component/library-view";
import { ProtectedLibrary } from "../../../feature/library/client/component/protected-library";

type LibraryMode = "classroom" | "standalone";

export function LibraryPageContent({ mode }: { mode: LibraryMode }) {
	const t = useTranslations("libraryPage");
	const isClassroom = mode === "classroom";
	const title = isClassroom ? t("classroomTitle") : t("standaloneTitle");
	const description = isClassroom ? t("classroomDescription") : t("standaloneDescription");

	return (
		<main className={styles.catalogPage}>
			<header className={styles.catalogIntro}>
				<p className={styles.kicker}>{t("kicker")}</p>
				<h1>{title}</h1>
				<p>{description}</p>
			</header>
			<ProtectedLibrary><LibraryView mode={mode}/></ProtectedLibrary>
		</main>
	);
}