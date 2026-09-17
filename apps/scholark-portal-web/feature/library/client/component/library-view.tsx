"use client";

import {
	AlertCircle,
	ArrowUpRight,
	BookOpen,
	Gamepad2,
	Play,
	RefreshCw
} from "lucide-react";
import Link from "next/link";

import styles from "../../../../asset/style/library.module.css";
import { useGetUserLibraryQuery } from "../api/library-api";

function formatDate(value: string): string {
	return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

function shortId(id: string): string {
	return id.replaceAll("-", "").slice(0, 7);
}

function sortLibraryItems<Item extends { game: { title: string }; createdAt: string; id: string }>(itemList: Item[]): Item[] {
	return [...itemList].sort((firstItem, secondItem) => {
		const titleOrder = firstItem.game.title.localeCompare(secondItem.game.title);
		if (titleOrder) return titleOrder;
		const createdAtOrder = Date.parse(secondItem.createdAt) - Date.parse(firstItem.createdAt);
		return createdAtOrder || firstItem.id.localeCompare(secondItem.id);
	});
}

function LibraryItemCard({ item }: { item: NonNullable<ReturnType<typeof useGetUserLibraryQuery>["data"]>["itemList"][number] }) {
	return (
		<article className={`${styles.item} ${item.isActive ? "" : styles.expiredItem}`}>
			<div className={styles.itemIcon}>{item.classroom ? <BookOpen aria-hidden="true"/> : <Gamepad2 aria-hidden="true"/>}</div>
			<div className={styles.itemMain}>
				<div className={styles.itemHeading}>
					<div><p className={styles.eyebrow}>{item.gameVersion.publisherVersion}</p><Link className={styles.licenseLink} href={`/game/${item.game.slug}`}><div className={styles.titleLine}><h3>{item.game.title}</h3></div></Link></div>
				</div>
				<dl className={styles.facts}>
					{item.customizationId ? <div><dt>Customization</dt><dd title={`Full customization ID: ${item.customizationId}`}>{shortId(item.customizationId)}</dd></div> : null}
					<div><dt>Access</dt><dd>{formatDate(item.startAt)} – {formatDate(item.endAt)}</dd></div>
					{item.classroom ? <div><dt>Classroom</dt><dd>{item.classroom.name}</dd></div> : null}
				</dl>
			</div>
			<div className={styles.actions}>
				{item.isActive ? <Link className={styles.runLink} href={`/library/${item.id}/run`}><Play aria-hidden="true"/>Run game</Link> : <span className={styles.expiredAction}>Expired</span>}
			</div>
		</article>
	);
}

function LibraryView() {
	const { data, error, isLoading, refetch } = useGetUserLibraryQuery();

	if (isLoading) {
		return <div className={styles.state}><RefreshCw className={styles.spin} aria-hidden="true"/><p>Loading your library...</p></div>;
	}

	if (error) {
		return <div className={styles.state}><AlertCircle aria-hidden="true"/><h2>Library unavailable</h2><p>We could not load your acquired games.</p><button className={styles.retryButton} onClick={() => refetch()} type="button">Try again</button></div>;
	}

	const itemList = data?.itemList ?? [];
	const classroomGroupList = Array.from(
		itemList.reduce((groupMap, item) => {
			if (item.classroom) {
				const group = groupMap.get(item.classroom.id) ?? { classroom: item.classroom, itemList: [] };
				group.itemList.push(item);
				groupMap.set(item.classroom.id, group);
			}
			return groupMap;
		}, new Map<string, { classroom: NonNullable<typeof itemList[number]["classroom"]>; itemList: typeof itemList }>()).values(),
	);
	const standaloneItemList = sortLibraryItems(itemList.filter((item) => !item.classroom));

	return itemList.length ? (
		<div className={styles.sections}>
			{classroomGroupList.map(({ classroom, itemList: classroomItemList }) => (
				<section className={styles.librarySection} key={classroom.id}>
					<div className={styles.sectionHeading}>
						<div><p className={styles.kicker}>Classroom</p><h2>{classroom.name}</h2></div>
						<Link href={`/classroom/${classroom.slug}`}>View classroom <ArrowUpRight aria-hidden="true"/></Link>
					</div>
					<div className={styles.list}>{sortLibraryItems(classroomItemList).map((item) => <LibraryItemCard item={item} key={item.id}/>)}</div>
				</section>
			))}
			{standaloneItemList.length ? (
				<section className={styles.librarySection}>
					<div className={styles.sectionHeading}>
						<div><p className={styles.kicker}>Personal access</p><h2>Standalone games</h2></div>
						<span>{standaloneItemList.length} {standaloneItemList.length === 1 ? "game" : "games"}</span>
					</div>
					<div className={styles.list}>{standaloneItemList.map((item) => <LibraryItemCard item={item} key={item.id}/>)}</div>
				</section>
			) : null}
		</div>
	) : <div className={styles.empty}><Gamepad2 aria-hidden="true"/><h2>Your library is waiting</h2><p>Games you acquire will appear here with their version and classroom context.</p><Link href="/catalog">Browse the catalog <ArrowUpRight aria-hidden="true"/></Link></div>;
}

export { LibraryView };
