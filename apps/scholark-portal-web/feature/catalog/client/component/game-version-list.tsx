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
	formatListingLanguage,
	formatListingPrice,
	formatListingPriceRange,
	type GameDetails,
	type GameVersion,
	getPublicGameListingOptionList,
	type PublicGameListing,
} from "../../shared/model/game";

function ListingSelector({
	game,
	version,
	listingList,
	licenseList,
	canAcquire,
}: {
	game: GameDetails;
	version: GameVersion;
	listingList: PublicGameListing[];
	licenseList: UserLibraryItem[];
	canAcquire: boolean;
}) {
	const locale = useLocale();
	const t = useTranslations("catalog");
	const sortedOptionList = getPublicGameListingOptionList(listingList).sort((firstOption, secondOption) =>
		formatListingLanguage(firstOption.language, locale).localeCompare(formatListingLanguage(secondOption.language, locale))
			|| firstOption.price.minorUnitAmount - secondOption.price.minorUnitAmount
			|| firstOption.id.localeCompare(secondOption.id),
	);
	const [selectedOptionId, setSelectedOptionId] = useState(sortedOptionList[0]?.id ?? "");
	const selectedOption = sortedOptionList.find((option) => option.id === selectedOptionId) ?? sortedOptionList[0];
	if (!selectedOption) {
		return null;
	}
	const selectedListing = listingList.find((listing) => listing.id === selectedOption.listingId);
	if (!selectedListing) return null;

	const selectedLicenseList = licenseList.filter(
		(item) => item.game.id === game.id
			&& item.gameVersion.id === version.id
			&& item.language === selectedOption.language
			&& item.courseType === "standard"
			&& !item.classroomGameListingId
			&& !item.customizationId,
	);
	const activeLicense = selectedLicenseList.find((item) => item.isActive);
	const hasExpiredLicense = selectedLicenseList.length > 0;
	const hasMultiplePrices = new Set(sortedOptionList.map((option) => `${option.price.currency}:${option.price.minorUnitAmount}`)).size > 1;

	return (
		<>
			{hasMultiplePrices ? (
				<div className={styles.listingPriceRange} aria-label={t("availablePriceRange", { priceRange: formatListingPriceRange(sortedOptionList, locale) })}>
					<strong>{formatListingPriceRange(sortedOptionList, locale)}</strong>
				</div>
			) : null}
			<div className={styles.versionAction}>
				<div className={styles.listingSelectionControls}>
					<select aria-label={t("chooseLanguageAndPrice")} value={selectedOption.id} onChange={(event) => setSelectedOptionId(event.target.value)}>
						{sortedOptionList.map((option) => (
							<option key={option.id} value={option.id}>
								{formatListingLanguage(option.language, locale)} · {formatListingPrice(option.price, locale)}
							</option>
						))}
					</select>
					<div className={styles.listingSelectionAction}>
						{activeLicense ? <Badge><CheckCircle2 data-icon="inline-start"/>{t("inLibrary")}</Badge> : hasExpiredLicense ? <Badge variant="outline">{t("expired")}</Badge> : null}
						{!activeLicense && canAcquire ? (
							<Link className={buttonVariants({ size: "sm" })} href={`/game/${game.slug}/acquire?listing=${encodeURIComponent(selectedListing.id)}&language=${encodeURIComponent(selectedOption.language)}`}>
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
								<ListingSelector
									game={game}
									version={version}
									listingList={version.publicListingList ?? []}
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
