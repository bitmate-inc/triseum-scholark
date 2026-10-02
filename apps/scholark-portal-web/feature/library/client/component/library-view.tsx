"use client";

import {
	AlertCircle,
	ArrowUpRight,
	BookOpen,
	Gamepad2,
	Info,
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

function shortId(id: string): string {
	return id.replaceAll("-", "").slice(0, 7);
}

function sortLibraryItems<Item extends { createdAt: string; id: string }>(itemList: Item[]): Item[] {
	return [...itemList].sort((firstItem, secondItem) => {
		const createdAtOrder = Date.parse(secondItem.createdAt) - Date.parse(firstItem.createdAt);
		return createdAtOrder || firstItem.id.localeCompare(secondItem.id);
	});
}

type ProgressSummary = { completedCount: number; totalCount: number; percentage: number };

function getProgressSummary(item: UserLibraryItem): ProgressSummary | undefined {
	const progress = item.progress;
	if (!progress || !Number.isFinite(progress.completedCount) || !Number.isFinite(progress.totalCount)) {
		return undefined;
	}

	const totalCount = Math.floor(progress.totalCount);
	if (totalCount <= 0) {
		return undefined;
	}

	const completedCount = Math.max(0, Math.min(totalCount, Math.floor(progress.completedCount)));
	return {
		completedCount,
		totalCount,
		percentage: Math.round((completedCount / totalCount) * 100),
	};
}

function getSampleProgressSummary(item: UserLibraryItem): ProgressSummary {
	const sampleIndex = [...item.id].reduce((total, character) => total + character.charCodeAt(0), 0) % 10;
	const completedCount = sampleIndex + 1;
	const totalCount = 10;

	return { completedCount, totalCount, percentage: completedCount * 10 };
}

function LibraryItemCard({ item, showProgress }: { item: UserLibraryItem; showProgress: boolean }) {
	const locale = useLocale();
	const t = useTranslations("library");
	const realProgress = showProgress ? getProgressSummary(item) : undefined;
	const isSampleProgress = showProgress && !realProgress && process.env.NODE_ENV !== "production";
	const progress = realProgress ?? (isSampleProgress ? getSampleProgressSummary(item) : undefined);
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
						<span className={styles.progressSummary}>{t("progress")} <strong>{progress.completedCount} / {progress.totalCount}</strong> <span>({progress.percentage}%)</span></span>
						<div className={styles.progressTooltip}>
							<button className={styles.progressTooltipTrigger} type="button" aria-label={t("progressDetails")} aria-describedby={`progress-details-${item.id}`}>
								<Info aria-hidden="true"/>
							</button>
							<div className={styles.progressTooltipContent} id={`progress-details-${item.id}`} role="tooltip">
								<dl>
									<div><dt>{t("completed")}</dt><dd>{t("objectiveCount", { count: progress.completedCount })}</dd></div>
									<div><dt>{t("remaining")}</dt><dd>{t("objectiveCount", { count: progress.totalCount - progress.completedCount })}</dd></div>
								</dl>
							</div>
						</div>
					</div>
					<div
						className={styles.progressTrack}
						role="progressbar"
						aria-label={t("overallProgress", { gameTitle: item.game.title })}
						aria-valuemin={0}
						aria-valuemax={progress.totalCount}
						aria-valuenow={progress.completedCount}
						aria-valuetext={t("progressValue", { completed: progress.completedCount, total: progress.totalCount })}
					>
						<span className={styles.progressFill} style={{ width: `${progress.percentage}%` }}/>
					</div>
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
							<div className={styles.list}>{sortLibraryItems(classroomItemList).map((item) => <LibraryItemCard item={item} showProgress key={item.id}/>)}</div>
						</div>
					)) : (
						<div className={styles.list}>{statusItemList.map((item) => <LibraryItemCard item={item} showProgress={false} key={item.id}/>)}</div>
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
