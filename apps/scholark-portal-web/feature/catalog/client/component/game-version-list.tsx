"use client";

import { Badge } from "@repo/ui/badge";
import { buttonVariants } from "@repo/ui/button";
import { CheckCircle2, MonitorPlay } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import styles from "../../../../asset/style/site.module.css";
import { Link } from "../../../../i18n/navigation";
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
	const locale = useLocale();
	const t = useTranslations("catalog");
	const sortedOfferList = [...offerList].sort((firstOffer, secondOffer) =>
		formatOfferLanguage(firstOffer.language, locale).localeCompare(formatOfferLanguage(secondOffer.language, locale))
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
				<div className={styles.offerPriceRange} aria-label={t("availablePriceRange", { priceRange: formatOfferPriceRange(sortedOfferList, locale) })}>
					<strong>{formatOfferPriceRange(sortedOfferList, locale)}</strong>
				</div>
			) : null}
			<div className={styles.versionAction}>
				<div className={styles.offerSelectionControls}>
					<select aria-label={t("chooseLanguageAndPrice")} value={selectedOffer.id} onChange={(event) => setSelectedOfferId(event.target.value)}>
						{sortedOfferList.map((offer) => (
							<option key={offer.id} value={offer.id}>
								{formatOfferLanguage(offer.language, locale)} · {formatOfferPrice(offer, locale)}
							</option>
						))}
					</select>
					<div className={styles.offerSelectionAction}>
						{activeLicense ? <Badge><CheckCircle2 data-icon="inline-start"/>{t("inLibrary")}</Badge> : hasExpiredLicense ? <Badge variant="outline">{t("expired")}</Badge> : null}
						{!activeLicense && canAcquire ? (
							<Link className={buttonVariants({ size: "sm" })} href={`/game/${game.slug}/acquire?offer=${encodeURIComponent(selectedOffer.id)}`}>
								<MonitorPlay data-icon="inline-start"/>{t("acquire")}
							</Link>
						) : null}
					</div>
				</div>
			</div>
		</>
	);
}

export function GameVersionList({ game }: { game: GameDetails }) {
	const t = useTranslations("catalog");
	const session = useAuthGetSessionQuery();
	const library = useGetUserLibraryQuery(undefined, { skip: !session.data });
	const licenseStateReady = !session.isLoading && (!session.data || (!library.isLoading && !library.error));
	const gameVersionList = game.gameVersionList ?? [];

	return (
		<section className={styles.versionSection}>
			<div className={styles.sectionHeading}>
				<div><p className={styles.kicker}>{t("chooseBuild")}</p><h2>{t("availableVersions")}</h2></div>
				<span>{t("versionCount", { count: gameVersionList.length })}</span>
			</div>
			{gameVersionList.length ? (
				<div className={styles.versionList}>
					{gameVersionList.map((version) => {
						return (
							<article className={styles.versionItem} key={version.id}>
								<div className={styles.versionMain}>
									<p className={styles.eyebrow}>{t("publisherVersion")}</p>
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
			) : <p className={styles.versionEmpty}>{t("noPublishedVersions")}</p>}
		</section>
	);
}
