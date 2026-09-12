"use client";

import {
	AlertCircle,
	ExternalLink,
	RefreshCw
} from "lucide-react";
import Link from "next/link";

import styles from "../../../../asset/style/acquisition.module.css";
import { useGetUserLibraryQuery } from "../api/library-api";

export function RunGameView({ id }: { id: string }) {
	const { data, error, isLoading } = useGetUserLibraryQuery();
	if (isLoading) {
		return <main className={styles.page}><RefreshCw className="animate-spin" aria-hidden="true"/><p>Preparing your game...</p></main>;
	}
	const item = data?.itemList.find((libraryItem) => libraryItem.id === id);
	if (error || !item || !item.isActive) {
		return <main className={styles.page}><AlertCircle aria-hidden="true"/><h1>Game unavailable</h1><p className={styles.detail}>This game is not available to launch from your library.</p><Link href="/library">Return to library</Link></main>;
	}

	return (
		<main className={styles.page}>
			<ExternalLink className={styles.successIcon} aria-hidden="true"/>
			<p className={styles.kicker}>Launching {item.game.title}</p>
			<h1>You are leaving ScholArk.</h1>
			<p className={styles.detail}>You will be redirected to the following location in 10 seconds.</p>
			<code className={styles.url}>{item.gameVersion.runUrl}</code>
			<p className={styles.note}>Automatic redirection is not enabled yet.</p>
		</main>
	);
}
