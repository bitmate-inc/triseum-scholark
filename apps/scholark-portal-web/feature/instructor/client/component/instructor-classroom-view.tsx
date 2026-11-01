"use client";

import {
	AlertCircle,
	ArrowLeft,
	Check,
	RefreshCw,
	Save
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type FormEvent,useState } from "react";

import styles from "../../../../asset/style/instructor.module.css";
import { Link } from "../../../../i18n/navigation";
import {
	type CreateInstructorClassroomGameGradingRuleRequestDto,
	type InstructorClassroomGameListingResponseDto,
	useInstructorCreateClassroomGameGradingRuleMutation,
	useInstructorGetClassroomQuery,
} from "../../../api/client/api/generated-api";

function formatDate(value: string, locale: string): string {
	return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value));
}

export function InstructorClassroomView({ classroomId }: { classroomId: string }) {
	const locale = useLocale();
	const t = useTranslations("instructor");
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
					<GradingRuleEditor classroomId={classroom.id} listing={listing} onSaved={() => refetch()}/>

					{listing.studentList.length ? (
						<div className={styles.tableWrap}>
							<table className={styles.table}>
								<thead>
									<tr>
										<th scope="col">{t("student")}</th>
										<th scope="col">{t("progress")}</th>
										<th scope="col">{t("grade")}</th>
										<th scope="col">{t("license")}</th>
										<th scope="col">{t("starts")}</th>
										<th scope="col">{t("ends")}</th>
									</tr>
								</thead>
								<tbody>
									{listing.studentList.map((student) => {
										const fullName = [student.firstName, student.lastName].filter(Boolean).join(" ");
										const studentName = fullName || t("student");
										const progress = student.progress?.summary?.completionPercent;
										const sectionList = student.progress?.sectionList ?? [];
										const gradeResult = student.gradeResult?.content;
										return (
											<tr key={`${student.id}-${student.startAt}`}>
												<th scope="row">
													<span className={styles.studentName}>{studentName}</span>
													<span className={styles.studentEmail}>{student.email}</span>
												</th>
												<td>
													{progress !== undefined && progress !== null ? (
														<div className={styles.progressCell}>
															<div className={styles.progressCaption}>
																<span>{formatNumber(progress, locale)}%</span>
															</div>
															<div
																className={styles.progressTrack}
																role="progressbar"
																aria-label={t("studentProgress", { studentName })}
																aria-valuemin={0}
																aria-valuemax={100}
																aria-valuenow={Math.max(0, Math.min(100, progress))}
																aria-valuetext={t("progressPercentage", { percentage: formatNumber(progress, locale) })}
															>
																<span className={styles.progressFill} style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}/>
															</div>
															{sectionList.length ? (
																<details className={styles.sectionDetails}>
																	<summary>{t("sectionDetails", { count: sectionList.length })}</summary>
																	<ul>
																		{sectionList.map((section) => {
																			const definition = listing.progressStructure?.sectionList.find(
																				(item) => item.sectionIndex === section.sectionIndex,
																			);
																			const metricList = definition?.metricList ?? [];
																			const metricText = metricList.map((metric) => {
																				const value = section.metrics?.[metric.key];
																				const formattedValue = value == null
																					? t("progressUnavailable")
																					: metric.pointsPossible == null
																						? formatNumber(value, locale)
																						: `${formatNumber(value, locale)} / ${formatNumber(metric.pointsPossible, locale)}`;
																				return `${metric.label}: ${formattedValue}`;
																			}).join(" · ");
																			return (
																				<li key={section.sectionIndex}>
																					<span>{definition?.label ?? section.sectionIndex}</span>
																					<span>{metricText || (section.completionPercent != null
																						? `${formatNumber(section.completionPercent, locale)}%`
																						: t("progressUnavailable"))}</span>
																				</li>
																			);
																		})}
																	</ul>
																</details>
															) : null}
														</div>
													) : <span className={styles.progressUnavailable}>{t("progressUnavailable")}</span>}
												</td>
												<td>
													{gradeResult ? (
														<div className={styles.gradeCell}>
															<strong>{gradeResult.scoreGiven == null
																? t("gradeUnavailable")
																: `${formatNumber(gradeResult.scoreGiven, locale)} / ${formatNumber(gradeResult.scoreMaximum, locale)}`}</strong>
															<span>{t(`gradingStatus.${gradeResult.gradingProgress}`)}</span>
														</div>
													) : <span className={styles.progressUnavailable}>{listing.gradingRule ? t("gradePending") : t("gradingRuleMissing")}</span>}
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

function formatNumber(value: number, locale: string): string {
	return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
}

function GradingRuleEditor({
	classroomId,
	listing,
	onSaved,
}: {
	classroomId: string;
	listing: InstructorClassroomGameListingResponseDto;
	onSaved: () => void;
}) {
	const t = useTranslations("instructor");
	const currentConfig = listing.gradingRule?.config;
	const progressSchemaVersion = listing.studentList.find((student) => student.progress)?.progress?.schemaVersion ?? currentConfig?.progressSchemaVersion ?? 1;
	const sectionOptionList = listing.progressStructure?.sectionList ?? [];
	const [method, setMethod] = useState<CreateInstructorClassroomGameGradingRuleRequestDto["method"]>(currentConfig?.method ?? "points");
	const [sectionIndexList, setSectionIndexList] = useState<string[]>(currentConfig?.sectionIndexList ?? []);
	const [scoreMaximum, setScoreMaximum] = useState(currentConfig?.scoreMaximum ?? 100);
	const [completionThresholdPercent, setCompletionThresholdPercent] = useState(currentConfig?.completionThresholdPercent ?? 100);
	const [allowPartial, setAllowPartial] = useState(currentConfig?.allowPartial ?? false);
	const [saved, setSaved] = useState(false);
	const [saveFailed, setSaveFailed] = useState(false);
	const [createRule, { isLoading }] = useInstructorCreateClassroomGameGradingRuleMutation();
	const hasSectionSelectionConflict = (sectionIndex: string) => sectionIndexList.some((selectedSectionIndex) =>
		selectedSectionIndex !== sectionIndex
		&& (sectionIndex.startsWith(`${selectedSectionIndex}.`) || selectedSectionIndex.startsWith(`${sectionIndex}.`)),
	);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSaved(false);
		setSaveFailed(false);
		try {
			await createRule({
				classroomId,
				classroomGameListingId: listing.id,
				createInstructorClassroomGameGradingRuleRequestDto: {
					allowPartial,
					completionThresholdPercent: method === "completion_threshold" ? completionThresholdPercent : undefined,
					method,
					progressSchemaVersion,
					schemaVersion: 1,
					scoreMaximum,
					sectionIndexList: method === "points" ? sectionIndexList : [],
				},
			}).unwrap();
			setSaved(true);
			onSaved();
		} catch {
			setSaveFailed(true);
		}
	}

	function handleMethodChange(value: CreateInstructorClassroomGameGradingRuleRequestDto["method"]): void {
		setMethod(value);
		if (value === "completion_threshold") {
			setAllowPartial(false);
		}
	}

	return (
		<form className={styles.gradingEditor} onSubmit={handleSubmit}>
			<div className={styles.gradingEditorHeading}>
				<div><h3>{t("gradingRule")}</h3>{listing.gradingRule ? <span>{t("gradingRevision", { revision: listing.gradingRule.revision })}</span> : null}</div>
				<p>{t("progressSchemaVersion", { version: progressSchemaVersion })}</p>
			</div>
			<div className={styles.gradingFields}>
				<label>{t("gradingMethod")}
					<select onChange={(event) => handleMethodChange(event.target.value as CreateInstructorClassroomGameGradingRuleRequestDto["method"])} value={method}>
						<option value="points">{t("pointsToPercentage")}</option>
						<option value="completion_threshold">{t("completionThreshold")}</option>
					</select>
				</label>
				<label>{t("scoreMaximum")}
					<input min="0.01" onChange={(event) => setScoreMaximum(Number(event.target.value))} required step="any" type="number" value={scoreMaximum}/>
				</label>
				{method === "completion_threshold" ? (
					<label>{t("completionThresholdPercent")}
						<input max="100" min="0" onChange={(event) => setCompletionThresholdPercent(Number(event.target.value))} required step="any" type="number" value={completionThresholdPercent}/>
					</label>
				) : null}
			</div>
			{method === "points" ? (
				<fieldset className={styles.sectionChoices}>
					<legend>{t("sectionsToGrade")}</legend>
					{sectionOptionList.length ? sectionOptionList.map((section) => {
						const isSelected = sectionIndexList.includes(section.sectionIndex);
						return (
							<label key={section.sectionIndex}>
								<input
									checked={isSelected}
									disabled={!isSelected && hasSectionSelectionConflict(section.sectionIndex)}
									onChange={(event) => setSectionIndexList(event.target.checked
										? [...sectionIndexList, section.sectionIndex]
										: sectionIndexList.filter((selectedSectionIndex) => selectedSectionIndex !== section.sectionIndex))}
									type="checkbox"
								/>
								<span>{section.label}</span>
							</label>
						);
					}) : <p>{t("sectionsUnavailable")}</p>}
				</fieldset>
			) : null}
			{method === "points" ? (
				<label className={styles.partialGradeOption}>
					<input checked={allowPartial} onChange={(event) => setAllowPartial(event.target.checked)} type="checkbox"/>
					<span>{t("allowPartialGrades")}</span>
				</label>
			) : null}
			<div className={styles.gradingEditorActions}>
				<button disabled={isLoading || (method === "points" && sectionIndexList.length === 0)} type="submit">
					{isLoading ? <RefreshCw className={styles.spin} aria-hidden="true"/> : saved ? <Check aria-hidden="true"/> : <Save aria-hidden="true"/>}
					{isLoading ? t("savingGradingRule") : saved ? t("gradingRuleSaved") : t("publishGradingRule")}
				</button>
				{saveFailed ? <span role="alert">{t("gradingRuleSaveFailed")}</span> : null}
			</div>
		</form>
	);
}