"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

import styles from "../../../../asset/style/acquisition.module.css";
import { useGetUserLibraryQuery, useLaunchGameQuery } from "../api/library-api";

export function RunGameView({ id }: { id: string }) {
	const { data, error, isLoading } = useGetUserLibraryQuery();
	const item = data?.itemList.find((libraryItem) => libraryItem.id === id);
	const launch = useLaunchGameQuery(id, { skip: !item || item.status !== "active" });

	if (isLoading) {
		return <main className={styles.page}><RefreshCw className="animate-spin" aria-hidden="true"/><p>Preparing your game...</p></main>;
	}
	if (error || !item || item.status !== "active" || launch.error) {
		return <main className={styles.page}><AlertCircle aria-hidden="true"/><h1>Game unavailable</h1><p className={styles.detail}>This game is not available to launch from your library.</p><Link href="/library">Return to library</Link></main>;
	}
	if (launch.isLoading || !launch.data) {
		return <main className={styles.page}><RefreshCw className="animate-spin" aria-hidden="true"/><p>Authorizing your game...</p></main>;
	}

	return (
		<main className={styles.page}>
			<p className={styles.kicker}>Launching {item.game.title}</p>
			<h1>Game access authorized.</h1>
			<p className={styles.detail}>Continue to the licensed Game Version {item.gameVersion.publisherVersion}.</p>
			<a className={styles.runLink} href={launch.data.launchUrl}>Launch game</a>
		</main>
	);
}
