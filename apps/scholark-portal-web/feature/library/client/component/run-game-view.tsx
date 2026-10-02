"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import styles from "../../../../asset/style/acquisition.module.css";
import { Link } from "../../../../i18n/navigation";
import { useGetUserLibraryQuery, useLaunchGameMutation } from "../api/library-api";

export function RunGameView({ id }: { id: string }) {
	const t = useTranslations("library");
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
		return <main className={styles.page}><RefreshCw className="animate-spin" aria-hidden="true"/><p>{t("preparingGame")}</p></main>;
	}
	if (error || !item || item.status !== "active" || launchError) {
		return <main className={styles.page}><AlertCircle aria-hidden="true"/><h1>{t("gameUnavailable")}</h1><p className={styles.detail}>{t("gameUnavailableDescription")}</p><Link href="/library">{t("returnToLibrary")}</Link></main>;
	}

	return (
		<main className={styles.page}>
			<p className={styles.kicker}>{t("launchingGame", { gameTitle: item.game.title })}</p>
			<h1>{launchData ? t("gameAuthorized") : t("preparingGame")}</h1>
			<p className={styles.detail}>{t("continueToVersion", { version: item.gameVersion.publisherVersion })}</p>
			{launchData ? (
				<>
					<p className={styles.detail}>{t("launchLinkValidity", { seconds: launchData.validForSeconds })}</p>
					<form action={launchData.launchUrl} method="post">
						<input name="launchTicket" type="hidden" value={launchData.launchTicket}/>
						<button className={styles.runLink} type="submit">{t("launchGame")}</button>
					</form>
				</>
			) : (
				<div aria-busy={launch.isLoading}>
					<p className={styles.detail} role="status">
						<RefreshCw className="animate-spin" aria-hidden="true"/> {t("loadingLaunchLink")}
					</p>
					<button className={styles.runLink} disabled type="button">{t("launchGame")}</button>
				</div>
			)}
		</main>
	);
}
