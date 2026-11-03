"use client";

import {
	AlertCircle,
	ArrowUpRight,
	BookOpen,
	Gamepad2,
	Play,
	RefreshCw
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import styles from "../../../../asset/style/library.module.css";
import { Link } from "../../../../i18n/navigation";
import { useGetUserLibraryQuery, type UserLibraryItem } from "../api/library-api";

type LibraryMode = "classroom" | "standalone";
type LibraryStatus = UserLibraryItem["status"];

const statusList: LibraryStatus[] = ["active", "scheduled", "expired"];

function formatDate(value: string, locale: string): string {
	return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value));
}

function formatNumber(value: number, locale: string): string {
	return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
}

function shortId(id: string): string {
	return id.replaceAll("-", "").slice(0, 7);
}

function sortLibraryItems<Item extends { createdAt: string; id: string }>(itemList: Item[]): Item[] {
	return [...itemList].sort((firstItem, secondItem) => {
		const createdAtOrder = Date.parse(secondItem.createdAt) - Date.parse(firstItem.createdAt);
		return createdAtOrder || firstItem.id.localeCompare(secondItem.id);
	});
}

function getProgressPercentage(item: UserLibraryItem): number | undefined {
	const completionPercent = item.progress?.summary?.completionPercent;
	if (typeof completionPercent !== "number" || !Number.isFinite(completionPercent)) {
		return undefined;
	}

	return Math.round(Math.max(0, Math.min(100, completionPercent)));
}

function LibraryItemCard({ item }: { item: UserLibraryItem }) {
	const locale = useLocale();
	const t = useTranslations("library");
	const progress = item.progress;
	const progressPercentage = getProgressPercentage(item);
	const sectionList = progress?.sectionList ?? [];
	const summaryMetricList = Object.entries(progress?.summary?.metrics ?? {});
	const progressStructure = item.gameVersion.progressStructure;
	const gradeResult = item.gradeResult;
	const itemClassName = item.status === "expired" ? `${styles.item} ${styles.expiredItem}` : styles.item;

	return (
		<article className={itemClassName}>
			<div className={styles.itemIcon}>{item.classroom ? <BookOpen aria-hidden="true"/> : <Gamepad2 aria-hidden="true"/>}</div>
			<div className={styles.itemMain}>
				<div className={styles.itemHeading}>
					<div><p className={styles.eyebrow}>{item.gameVersion.publisherVersion}</p><Link className={styles.licenseLink} href={`/game/${item.game.slug}`}><div className={styles.titleLine}><h3>{item.game.title}</h3></div></Link></div>
				</div>
				<dl className={styles.facts}>
					{item.customizationId ? <div><dt>{t("customization")}</dt><dd title={t("fullCustomizationId", { id: item.customizationId })}>{shortId(item.customizationId)}</dd></div> : null}
				</dl>
			</div>
			<div className={styles.actions}>
				<dl className={styles.actionAccess}><dt>{t("access")}</dt><dd>{formatDate(item.startAt, locale)} – {formatDate(item.endAt, locale)}</dd></dl>
				{item.status === "active" ? <Link className={styles.runLink} href={`/library/${item.id}/run`}><Play aria-hidden="true"/>{t("runGame")}</Link> : <span className={styles.expiredAction}>{item.status === "scheduled" ? t("scheduled") : t("expired")}</span>}
			</div>
			{progress ? (
				<div className={styles.progressSection}>
					<div className={styles.progressHeading}>
						<span className={styles.progressSummary}>
							{t("progress")}
							{progressPercentage !== undefined ? <strong>{progressPercentage}%</strong> : null}
						</span>
					</div>
					{progressPercentage !== undefined ? (
						<div
							className={styles.progressTrack}
							role="progressbar"
							aria-label={t("overallProgress", { gameTitle: item.game.title })}
							aria-valuemin={0}
							aria-valuemax={100}
							aria-valuenow={progressPercentage}
							aria-valuetext={t("progressPercentage", { percentage: progressPercentage })}
						>
							<span className={styles.progressFill} style={{ width: `${progressPercentage}%` }}/>
						</div>
					) : null}
					{sectionList.length || summaryMetricList.length ? (
						<details className={styles.progressDetails}>
							<summary>{t("progressDetails")}</summary>
							<p className={styles.progressContext}>{t("progressSchemaVersion", { version: progress.schemaVersion })}</p>
							<ul>
								{sectionList.map((section) => {
									const structureMatches = progressStructure?.schemaVersion === progress.schemaVersion;
									const sectionDefinition = structureMatches
										? progressStructure.sectionList.find((definition) => definition.sectionIndex === section.sectionIndex)
										: undefined;
									const metricDefinitionList = sectionDefinition?.metricList ?? [];
									const metricLineList = metricDefinitionList.map((metric) => {
										const value = section.metrics?.[metric.key];
										const formattedValue = value == null
											? t("progressUnavailable")
											: metric.pointsPossible == null
												? formatNumber(value, locale)
												: `${formatNumber(value, locale)} / ${formatNumber(metric.pointsPossible, locale)}`;
										return `${metric.label}: ${formattedValue}`;
									});
									const unconfiguredMetricLineList = Object.entries(section.metrics ?? {})
										.filter(([key]) => !metricDefinitionList.some((metric) => metric.key === key))
										.map(([key, value]) => `${key}: ${value == null ? t("progressUnavailable") : formatNumber(value, locale)}`);
									if (section.completionPercent != null) {
										metricLineList.push(`${t("sectionCompletion")}: ${formatNumber(section.completionPercent, locale)}%`);
									}

									return (
										<li key={section.sectionIndex}>
											<strong>{sectionDefinition?.label ?? t("sectionIndexFallback", { sectionIndex: section.sectionIndex })}</strong>
											<span>{[...metricLineList, ...unconfiguredMetricLineList].join(" · ") || t("progressUnavailable")}</span>
										</li>
									);
								})}
								{summaryMetricList.length ? (
									<li>
										<strong>{t("summaryMetrics")}</strong>
										<span>{summaryMetricList.map(([key, value]) => `${key}: ${value == null
											? t("progressUnavailable")
											: formatNumber(value, locale)}`).join(" · ")}</span>
									</li>
								) : null}
							</ul>
						</details>
					) : null}
				</div>
			) : null}
			{gradeResult ? (
				<div className={styles.gradeSection}>
					<div className={styles.progressHeading}>
						<span className={styles.progressSummary}>{t("grade")}</span>
						<strong>{gradeResult.content.scoreGiven == null
							? t("gradeUnavailable")
							: `${formatNumber(gradeResult.content.scoreGiven, locale)} / ${formatNumber(gradeResult.content.scoreMaximum, locale)}`}</strong>
					</div>
					<div className={styles.gradeMeta}>
						<span>{t(`gradingStatus.${gradeResult.content.gradingProgress}`)}</span>
						<span>{t("gradingRuleRevision", { revision: gradeResult.ruleRevision })}</span>
					</div>
					{gradeResult.content.sectionResultList.length ? (
						<details className={styles.progressDetails}>
							<summary>{t("gradeDetails")}</summary>
							<ul>
								{gradeResult.content.sectionResultList.map((section) => (
									<li key={section.sectionIndex}>
										<strong>{section.label}</strong>
										<span>{t("gradeSectionValue", {
											percentage: formatNumber(section.percentage, locale),
											points: formatNumber(section.points, locale),
											pointsPossible: formatNumber(section.pointsPossible, locale),
										})}</span>
									</li>
								))}
							</ul>
						</details>
					) : null}
				</div>
			) : null}
		</article>
	);
}

function getClassroomGroupList(itemList: UserLibraryItem[]) {
	const groupMap = new Map<string, { classroom: NonNullable<UserLibraryItem["classroom"]>; itemList: UserLibraryItem[] }>();
	for (const item of itemList) {
		if (!item.classroom) {
			continue;
		}
		const group = groupMap.get(item.classroom.id) ?? { classroom: item.classroom, itemList: [] };
		group.itemList.push(item);
		groupMap.set(item.classroom.id, group);
	}

	return [...groupMap.values()].sort((firstGroup, secondGroup) =>
		firstGroup.classroom.name.localeCompare(secondGroup.classroom.name),
	);
}

function LibraryView({ mode = "classroom" }: { mode?: LibraryMode }) {
	const t = useTranslations("library");
	const { data, error, isLoading, refetch } = useGetUserLibraryQuery();

	if (isLoading) {
		return <div className={styles.state}><RefreshCw className={styles.spin} aria-hidden="true"/><p>{t("loadingLibrary")}</p></div>;
	}

	if (error) {
		return <div className={styles.state}><AlertCircle aria-hidden="true"/><h2>{t("unavailable")}</h2><p>{t("loadFailed")}</p><button className={styles.retryButton} onClick={() => refetch()} type="button">{t("tryAgain")}</button></div>;
	}

	const itemList = data?.itemList ?? [];
	const selectedItemList = itemList.filter((item) => mode === "classroom" ? Boolean(item.classroom) : !item.classroom);
	const statusGroupList = statusList
		.map((status) => ({ status, itemList: sortLibraryItems(selectedItemList.filter((item) => item.status === status)) }))
		.filter((group) => group.itemList.length > 0);

	return (
		<div className={styles.sections}>
			<nav className={styles.libraryTabs} aria-label={t("gameLibrary")}>
				<Link href="/library/classroom" aria-current={mode === "classroom" ? "page" : undefined}>{t("classroom")}</Link>
				<Link href="/library/standalone" aria-current={mode === "standalone" ? "page" : undefined}>{t("standalone")}</Link>
			</nav>
			{statusGroupList.length ? statusGroupList.map(({ status, itemList: statusItemList }) => (
				<section className={styles.librarySection} key={status}>
					{status === "expired" ? (
						<div className={styles.statusHeading}>
							<h2>{t("expired")}</h2>
							<span>{t("gameCount", { count: statusItemList.length })}</span>
						</div>
					) : null}
					{mode === "classroom" ? getClassroomGroupList(statusItemList).map(({ classroom, itemList: classroomItemList }) => (
						<div className={styles.classroomGroup} key={`${status}-${classroom.id}`}>
							<div className={styles.sectionHeading}>
								<h3><Link className={styles.classroomLink} href={`/classroom/${classroom.slug}`}>{classroom.name}</Link></h3>
							</div>
							<div className={styles.list}>{sortLibraryItems(classroomItemList).map((item) => <LibraryItemCard item={item} key={item.id}/>)}</div>
						</div>
					)) : (
						<div className={styles.list}>{statusItemList.map((item) => <LibraryItemCard item={item} key={item.id}/>)}</div>
					)}
				</section>
			)) : (
				<div className={styles.empty}>
					<Gamepad2 aria-hidden="true"/>
					<h2>{mode === "classroom" ? t("noClassroomGames") : t("noStandaloneGames")}</h2>
					<p>{mode === "classroom" ? t("noClassroomGamesDescription") : t("noStandaloneGamesDescription")}</p>
					<Link href={mode === "classroom" ? "/institution" : "/catalog"}>{mode === "classroom" ? t("exploreInstitution") : t("browseCatalog")} <ArrowUpRight aria-hidden="true"/></Link>
				</div>
			)}
		</div>
	);
}

export { LibraryView };
