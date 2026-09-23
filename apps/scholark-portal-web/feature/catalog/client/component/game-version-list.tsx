"use client";

import { Badge } from "@repo/ui/badge";
import { buttonVariants } from "@repo/ui/button";
import { CheckCircle2, MonitorPlay } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import styles from "../../../../asset/style/site.module.css";
import { useAuthGetSessionQuery } from "../../../api/client/api/generated-api";
import { useGetUserLibraryQuery, type UserLibraryItem } from "../../../library/client/api/library-api";
import {
	formatOfferLanguage,
	formatOfferPrice,
	formatOfferPriceRange,
	type GameDetails,
	type GameVersion,
	type PublicGameOffer,
} from "../../shared/model/game";

function OfferSelector({
	game,
	version,
	offerList,
	licenseList,
	canAcquire,
}: {
	game: GameDetails;
	version: GameVersion;
	offerList: PublicGameOffer[];
	licenseList: UserLibraryItem[];
	canAcquire: boolean;
}) {
	const sortedOfferList = [...offerList].sort((firstOffer, secondOffer) =>
		formatOfferLanguage(firstOffer.language).localeCompare(formatOfferLanguage(secondOffer.language))
			|| firstOffer.price.minorUnitAmount - secondOffer.price.minorUnitAmount
			|| firstOffer.id.localeCompare(secondOffer.id),
	);
	const [selectedOfferId, setSelectedOfferId] = useState(sortedOfferList[0]?.id ?? "");
	const selectedOffer = sortedOfferList.find((offer) => offer.id === selectedOfferId) ?? sortedOfferList[0];
	if (!selectedOffer) {
		return null;
	}

	const selectedLicenseList = licenseList.filter(
		(item) => item.game.id === game.id
			&& item.gameVersion.id === version.id
			&& item.gameVariant.id === selectedOffer.gameVariantId,
	);
	const activeLicense = selectedLicenseList.find((item) => item.isActive);
	const hasExpiredLicense = selectedLicenseList.length > 0;
	const hasMultiplePrices = new Set(sortedOfferList.map((offer) => `${offer.price.currency}:${offer.price.minorUnitAmount}`)).size > 1;

	return (
		<>
			{hasMultiplePrices ? (
				<div className={styles.offerPriceRange} aria-label={`Available price range ${formatOfferPriceRange(sortedOfferList)}`}>
					<strong>{formatOfferPriceRange(sortedOfferList)}</strong>
				</div>
			) : null}
			<div className={styles.versionAction}>
				<div className={styles.offerSelectionControls}>
					<select aria-label="Choose language and price" value={selectedOffer.id} onChange={(event) => setSelectedOfferId(event.target.value)}>
						{sortedOfferList.map((offer) => (
							<option key={offer.id} value={offer.id}>
								{formatOfferLanguage(offer.language)} · {formatOfferPrice(offer)}
							</option>
						))}
					</select>
					<div className={styles.offerSelectionAction}>
						{activeLicense ? <Badge><CheckCircle2 data-icon="inline-start"/>In Library</Badge> : hasExpiredLicense ? <Badge variant="outline">Expired</Badge> : null}
						{!activeLicense && canAcquire ? (
							<Link className={buttonVariants({ size: "sm" })} href={`/game/${game.slug}/acquire?offer=${encodeURIComponent(selectedOffer.id)}`}>
								<MonitorPlay data-icon="inline-start"/>Acquire
							</Link>
						) : null}
					</div>
				</div>
			</div>
		</>
	);
}

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
								<OfferSelector
									game={game}
									version={version}
									offerList={version.publicOfferList ?? []}
									licenseList={library.data?.itemList ?? []}
									canAcquire={licenseStateReady}
								/>
							</article>
						);
					})}
				</div>
			) : <p className={styles.versionEmpty}>No published versions are currently available.</p>}
		</section>
	);
}
