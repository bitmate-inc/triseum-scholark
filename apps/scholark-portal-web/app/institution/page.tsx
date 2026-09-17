import type { Metadata } from "next";

import styles from "../../asset/style/site.module.css";
import { AcademicSearch } from "../../feature/catalog/client/component/academic-search";
import { getInstitutionListRequest } from "../../feature/catalog/server/request/education.request";

export const metadata: Metadata = {
	title: "Institutions · ScholArk",
	description: "Browse institutions, courses, and classrooms on ScholArk.",
};

export default async function InstitutionCatalogPage() {
	const response = await getInstitutionListRequest();

	return (
		<main className={styles.catalogPage}>
			<header className={styles.catalogIntro}>
				<p className={styles.kicker}>Institutions</p>
				<h1>Find where learning happens.</h1>
				<p>Browse institutions and explore the courses, classrooms, and educational games they bring together.</p>
			</header>
			<AcademicSearch resource="institution" initialItemList={response.institutionList} initialTotalItemCount={response.totalItemCount} label="Institutions"/>
		</main>
	);
}