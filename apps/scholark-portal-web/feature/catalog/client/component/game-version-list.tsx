"use client";

import { Badge } from "@repo/ui/badge";
import { buttonVariants } from "@repo/ui/button";
import { CheckCircle2, MonitorPlay } from "lucide-react";
import Link from "next/link";

import styles from "../../../../asset/style/site.module.css";
import { useAuthGetSessionQuery } from "../../../api/client/api/generated-api";
import { useGetUserLibraryQuery } from "../../../library/client/api/library-api";
import {
	formatOfferMode,
	formatOfferPrice,
	type GameDetails,
} from "../../shared/model/game";

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
						return (
							<article className={styles.versionItem} key={version.id}>
								<div className={styles.versionMain}>
									<p className={styles.eyebrow}>Publisher version</p>
									<h3>{version.publisherVersion}</h3>
								</div>
								{version.description ? <p className={styles.versionDescription}>{version.description}</p> : <span aria-hidden="true"/>}
								<div className={styles.versionAction}>
									{(version.publicOfferList ?? []).map((offer) => {
										const offerLicenses = (library.data?.itemList ?? []).filter(
											(item) => item.game.id === game.id
												&& item.gameVersion.id === version.id
												&& item.gameVariant.id === offer.gameVariantId,
										);
										const activeLicense = offerLicenses.find((item) => item.isActive);

										return (
											<div key={offer.id}>
												<p>{offer.language} · {formatOfferMode(offer.mode)} · {formatOfferPrice(offer)}</p>
												{activeLicense ? <Badge><CheckCircle2 data-icon="inline-start"/>In Library</Badge> : offerLicenses.length ? <Badge variant="outline">In Library (Expired)</Badge> : null}
												{!activeLicense && licenseStateReady ? (
													<Link className={buttonVariants({ size: "sm" })} href={`/game/${game.slug}/acquire?offer=${encodeURIComponent(offer.id)}`}>
														<MonitorPlay data-icon="inline-start"/>Acquire
													</Link>
												) : null}
											</div>
										);
									})}
								</div>
							</article>
						);
					})}
				</div>
			) : <p className={styles.versionEmpty}>No published versions are currently available.</p>}
		</section>
	);
}
