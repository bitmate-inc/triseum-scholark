"use client";

import {
	AlertCircle,
	ArrowUpRight,
	BookOpen,
	Gamepad2,
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

function LibraryView() {
	const { data, error, isLoading, refetch } = useGetUserLibraryQuery();

	if (isLoading) {
		return <div className={styles.state}><RefreshCw className={styles.spin} aria-hidden="true"/><p>Loading your library...</p></div>;
	}

	if (error) {
		return <div className={styles.state}><AlertCircle aria-hidden="true"/><h2>Library unavailable</h2><p>We could not load your acquired games.</p><button className={styles.retryButton} onClick={() => refetch()} type="button">Try again</button></div>;
	}

	const itemList = data?.itemList ?? [];
	return itemList.length ? (
		<div className={styles.list}>
			{itemList.map((item) => (
				<article className={styles.item} key={item.id}>
					<div className={styles.itemIcon}>{item.classroom ? <BookOpen aria-hidden="true"/> : <Gamepad2 aria-hidden="true"/>}</div>
					<div className={styles.itemMain}>
						<div className={styles.itemHeading}>
							<div><p className={styles.eyebrow}>{item.classroom ? "Classroom game" : "Standalone game"}</p><h2>{item.game.title}</h2></div>
							<span className={item.isActive ? styles.active : styles.expired}>{item.isActive ? "Active" : "Expired"}</span>
						</div>
						<dl className={styles.facts}>
							<div><dt>Version</dt><dd>{item.gameVersion.publisherVersion}</dd></div>
							{item.customizationId ? <div><dt>Customization</dt><dd title={`Full customization ID: ${item.customizationId}`}>{shortId(item.customizationId)}</dd></div> : null}
							<div><dt>Access</dt><dd>{formatDate(item.startAt)} – {formatDate(item.endAt)}</dd></div>
							{item.classroom ? <div><dt>Classroom</dt><dd>{item.classroom.name}</dd></div> : null}
						</dl>
					</div>
					<Link aria-label={`Open ${item.game.title}`} className={styles.openLink} href={`/game/${item.game.slug}`}><ArrowUpRight aria-hidden="true"/></Link>
				</article>
			))}
		</div>
	) : <div className={styles.empty}><Gamepad2 aria-hidden="true"/><h2>Your library is waiting</h2><p>Games you acquire will appear here with their version and classroom context.</p><Link href="/catalog">Browse the catalog <ArrowUpRight aria-hidden="true"/></Link></div>;
}

export { LibraryView };