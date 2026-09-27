"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import styles from "../../../../asset/style/acquisition.module.css";
import { useGetUserLibraryQuery, useLaunchGameMutation } from "../api/library-api";

export function RunGameView({ id }: { id: string }) {
	const { data, error, isLoading } = useGetUserLibraryQuery();
	const item = data?.itemList.find((libraryItem) => libraryItem.id === id);
	const [createLaunchTicket, launch] = useLaunchGameMutation();
	const requestedLicenseId = useRef<string | null>(null);
	const launchData = launch.originalArgs === id ? launch.data : undefined;
	const launchError = launch.originalArgs === id ? launch.error : undefined;

	useEffect(() => {
		if (item?.status !== "active") {
			requestedLicenseId.current = null;
			return;
		}
		if (requestedLicenseId.current !== id) {
			requestedLicenseId.current = id;
			void createLaunchTicket(id);
		}
	}, [createLaunchTicket, id, item?.status]);

	if (isLoading) {
		return <main className={styles.page}><RefreshCw className="animate-spin" aria-hidden="true"/><p>Preparing your game...</p></main>;
	}
	if (error || !item || item.status !== "active" || launchError) {
		return <main className={styles.page}><AlertCircle aria-hidden="true"/><h1>Game unavailable</h1><p className={styles.detail}>This game is not available to launch from your library.</p><Link href="/library">Return to library</Link></main>;
	}

	return (
		<main className={styles.page}>
			<p className={styles.kicker}>Launching {item.game.title}</p>
			<h1>{launchData ? "Game access authorized." : "Preparing your game."}</h1>
			<p className={styles.detail}>Continue to the licensed Game Version {item.gameVersion.publisherVersion}.</p>
			{launchData ? (
				<>
					<p className={styles.detail}>This launch link is valid for {launchData.validForSeconds} seconds.</p>
					<form action={launchData.launchUrl} method="post">
						<input name="launchTicket" type="hidden" value={launchData.launchTicket}/>
						<button className={styles.runLink} type="submit">Launch game</button>
					</form>
				</>
			) : (
				<div aria-busy={launch.isLoading}>
					<p className={styles.detail} role="status">
						<RefreshCw className="animate-spin" aria-hidden="true"/> Loading secure launch link...
					</p>
					<button className={styles.runLink} disabled type="button">Launch game</button>
				</div>
			)}
		</main>
	);
}
