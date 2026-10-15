"use client";

import {
	AlertCircle,
	ArrowUpRight,
	RefreshCw
} from "lucide-react";
import { useTranslations } from "next-intl";

import styles from "../../../../asset/style/instructor.module.css";
import { Link } from "../../../../i18n/navigation";
import { useInstructorGetClassroomListQuery } from "../../../api/client/api/generated-api";

export function InstructorDashboard() {
	const t = useTranslations("instructor");
	const { data, error, isLoading, refetch } = useInstructorGetClassroomListQuery();

	if (isLoading) {
		return <main className={styles.page}><div className={styles.state}><RefreshCw className={styles.spin} aria-hidden="true"/><p>{t("loadingClassrooms")}</p></div></main>;
	}

	if (error) {
		return (
			<main className={styles.page}>
				<div className={styles.state} role="alert">
					<AlertCircle aria-hidden="true"/>
					<h1>{t("classroomsUnavailable")}</h1>
					<p>{t("classroomsLoadFailed")}</p>
					<button className={styles.retryButton} onClick={() => refetch()} type="button">{t("tryAgain")}</button>
				</div>
			</main>
		);
	}

	const classroomList = data?.classroomList ?? [];

	return (
		<main className={styles.page}>
			<header className={styles.pageHeader}>
				<div>
					<p className={styles.kicker}>{t("portalLabel")}</p>
					<h1>{t("classrooms")}</h1>
					<p className={styles.description}>{t("classroomsDescription")}</p>
				</div>
				<p className={styles.count}>{t("classroomCount", { count: classroomList.length })}</p>
			</header>

			{classroomList.length ? (
				<div className={styles.tableWrap}>
					<table className={styles.table}>
						<thead>
							<tr>
								<th scope="col">{t("classroom")}</th>
								<th scope="col">{t("institution")}</th>
								<th scope="col">{t("courseType")}</th>
								<th scope="col">{t("language")}</th>
								<th scope="col"><span className={styles.srOnly}>{t("openClassroom")}</span></th>
							</tr>
						</thead>
						<tbody>
							{classroomList.map((classroom) => (
								<tr key={classroom.id}>
									<th scope="row">
										<Link className={styles.classroomLink} href={`/instructor/classrooms/${classroom.id}`}>
											{classroom.name}
										</Link>
										<span className={styles.secondary}>{classroom.code}</span>
									</th>
									<td>{classroom.institution.name}</td>
									<td>{classroom.courseType === "game-based" ? t("courseTypeGameBased") : t("courseTypeStandard")}</td>
									<td>{classroom.language}</td>
									<td>
										<Link className={styles.openLink} href={`/instructor/classrooms/${classroom.id}`}>
											{t("openClassroom")}<ArrowUpRight aria-hidden="true"/>
										</Link>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<div className={styles.emptyState}>
					<h2>{t("noClassrooms")}</h2>
					<p>{t("noClassroomsDescription")}</p>
				</div>
			)}
		</main>
	);
}