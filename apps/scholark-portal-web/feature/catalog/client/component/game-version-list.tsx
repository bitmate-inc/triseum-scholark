"use client";

import { Badge } from "@repo/ui/badge";
import { buttonVariants } from "@repo/ui/button";
import { CheckCircle2, MonitorPlay } from "lucide-react";
import Link from "next/link";

import styles from "../../../../asset/style/site.module.css";
import { useAuthGetSessionQuery } from "../../../api/client/api/generated-api";
import { useGetUserLibraryQuery } from "../../../library/client/api/library-api";
import type { GameDetails } from "../../shared/model/game";

export function GameVersionList({ game }: { game: GameDetails }) {
	const session = useAuthGetSessionQuery();
	const library = useGetUserLibraryQuery(undefined, { skip: !session.data });
	const licenseStateReady = !session.isLoading && (!session.data || (!library.isLoading && !library.error));
	const gameVersionList = game.gameVersionList ?? [];

	return (
		<section className={styles.versionSection}>
			<div className={styles.sectionHeading}>
				<div><p className={styles.kicker}>Choose your build</p><h2>Available versions</h2></div>
				<span>{gameVersionList.length.toString().padStart(2, "0")} versions</span>
			</div>
			{gameVersionList.length ? (
				<div className={styles.versionList}>
					{gameVersionList.map((version) => {
						const licenseList = (library.data?.itemList ?? []).filter(
							(item) => item.game.id === game.id && item.gameVersion.id === version.id,
						);
						const activeLicense = licenseList.find((item) => item.isActive);

						return (
							<article className={styles.versionItem} key={version.id}>
								<div className={styles.versionMain}>
									<p className={styles.eyebrow}>Publisher version</p>
									<h3>{version.publisherVersion}</h3>
								</div>
								{version.description ? <p className={styles.versionDescription}>{version.description}</p> : <span aria-hidden="true"/>}
								<div className={styles.versionAction}>
									{activeLicense ? <Badge><CheckCircle2 data-icon="inline-start"/>In Library</Badge> : licenseList.length ? <Badge variant="outline">In Library (Expired)</Badge> : null}
									{!activeLicense && version.publicOfferId && licenseStateReady ? (
										<Link className={buttonVariants({ size: "sm" })} href={`/game/${game.slug}/acquire?version=${encodeURIComponent(version.id)}`}>
											<MonitorPlay data-icon="inline-start"/>Acquire
										</Link>
									) : null}
								</div>
							</article>
						);
					})}
				</div>
			) : <p className={styles.versionEmpty}>No published versions are currently available.</p>}
		</section>
	);
}
