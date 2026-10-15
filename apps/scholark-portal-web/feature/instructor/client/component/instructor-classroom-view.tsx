"use client";

import {
	AlertCircle,
	ArrowLeft,
	RefreshCw
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import styles from "../../../../asset/style/instructor.module.css";
import { Link } from "../../../../i18n/navigation";
import { useInstructorGetClassroomQuery } from "../../../api/client/api/generated-api";

function formatDate(value: string, locale: string): string {
	return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value));
}

function getSampleProgressSummary(id: string): { completedCount: number; percentage: number; totalCount: number } {
	const sampleIndex = [...id].reduce((total, character) => total + character.charCodeAt(0), 0) % 10;
	const completedCount = sampleIndex + 1;
	const totalCount = 10;

	return { completedCount, percentage: completedCount * 10, totalCount };
}

export function InstructorClassroomView({ classroomId }: { classroomId: string }) {
	const locale = useLocale();
	const t = useTranslations("instructor");
	const libraryT = useTranslations("library");
	const showSampleProgress = process.env.NODE_ENV !== "production";
	const { data, error, isLoading, refetch } = useInstructorGetClassroomQuery({ classroomId });

	if (isLoading) {
		return <main className={styles.page}><div className={styles.state}><RefreshCw className={styles.spin} aria-hidden="true"/><p>{t("loadingClassroom")}</p></div></main>;
	}

	if (error || !data) {
		return (
			<main className={styles.page}>
				<div className={styles.state} role="alert">
					<AlertCircle aria-hidden="true"/>
					<h1>{t("classroomUnavailable")}</h1>
					<p>{t("classroomLoadFailed")}</p>
					<button className={styles.retryButton} onClick={() => refetch()} type="button">{t("tryAgain")}</button>
				</div>
			</main>
		);
	}

	const { classroom, classroomGameListingList } = data;

	return (
		<main className={styles.page}>
			<Link className={styles.backLink} href="/instructor"><ArrowLeft aria-hidden="true"/>{t("backToClassrooms")}</Link>
			<header className={styles.pageHeader}>
				<div>
					<p className={styles.kicker}>{classroom.institution.name}</p>
					<h1>{classroom.name}</h1>
					<p className={styles.description}>{t("classroomDetails", { code: classroom.code })}</p>
				</div>
				<p className={styles.count}>{t("gameCount", { count: classroomGameListingList.length })}</p>
			</header>

			{classroomGameListingList.length ? classroomGameListingList.map((listing) => (
				<section className={styles.gameSection} key={listing.id}>
					<header className={styles.gameHeader}>
						<div>
							<p className={styles.kicker}>{t("publisherVersion", { version: listing.publisherVersion })}</p>
							<h2>{listing.gameTitle}</h2>
						</div>
						<p className={styles.count}>{t("studentCount", { count: listing.studentList.length })}</p>
					</header>

					{listing.studentList.length ? (
						<div className={styles.tableWrap}>
							<table className={styles.table}>
								<thead>
									<tr>
										<th scope="col">{t("student")}</th>
										<th scope="col">{t("progress")}</th>
										<th scope="col">{t("license")}</th>
										<th scope="col">{t("starts")}</th>
										<th scope="col">{t("ends")}</th>
									</tr>
								</thead>
								<tbody>
									{listing.studentList.map((student) => {
										const fullName = [student.firstName, student.lastName].filter(Boolean).join(" ");
										const studentName = fullName || t("student");
										const progress = showSampleProgress
											? getSampleProgressSummary(`${listing.id}-${student.id}-${student.startAt}`)
											: undefined;
										return (
											<tr key={`${student.id}-${student.startAt}`}>
												<th scope="row">
													<span className={styles.studentName}>{studentName}</span>
													<span className={styles.studentEmail}>{student.email}</span>
												</th>
												<td>
													{progress ? (
														<div className={styles.progressCell}>
															<div className={styles.progressCaption}>
																<span>{progress.completedCount} / {progress.totalCount} ({progress.percentage}%)</span>
																<span className={styles.sampleLabel}>{t("sampleProgress")}</span>
															</div>
															<div
																className={styles.progressTrack}
																role="progressbar"
																aria-label={t("studentProgress", { studentName })}
																aria-valuemin={0}
																aria-valuemax={progress.totalCount}
																aria-valuenow={progress.completedCount}
																aria-valuetext={libraryT("progressValue", { completed: progress.completedCount, total: progress.totalCount })}
															>
																<span className={styles.progressFill} style={{ width: `${progress.percentage}%` }}/>
															</div>
														</div>
													) : <span className={styles.progressUnavailable}>{t("progressUnavailable")}</span>}
												</td>
												<td><span className={`${styles.status} ${styles[student.licenseStatus]}`}>{t(student.licenseStatus)}</span></td>
												<td>{formatDate(student.startAt, locale)}</td>
												<td>{formatDate(student.endAt, locale)}</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					) : (
						<p className={styles.emptyInline}>{t("noStudents")}</p>
					)}
				</section>
			)) : (
				<div className={styles.emptyState}>
					<h2>{t("noGames")}</h2>
					<p>{t("noGamesDescription")}</p>
				</div>
			)}
		</main>
	);
}