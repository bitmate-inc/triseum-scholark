"use client";

import { Badge } from "@repo/ui/badge";
import { Button, buttonVariants } from "@repo/ui/button";
import {
	CheckCircle2,
	Clock3,
	KeyRound,
	MonitorPlay,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import styles from "../../../../asset/style/site.module.css";
import { Link } from "../../../../i18n/navigation";
import { ClassroomGameCodeRedemption } from "../../../acquisition/client/component/classroom-game-code-redemption";
import { useAuthGetSessionQuery } from "../../../api/client/api/generated-api";
import { useGetUserLibraryQuery } from "../../../library/client/api/library-api";
import type { ClassroomGame } from "../../shared/model/education";
import {
	formatEstimatedLength,
	formatOfferLanguage,
	formatOfferMode,
	getGameTagList
} from "../../shared/model/game";

function formatDateTime(value: string, locale: string): string {
	return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}


function formatPrice(price: ClassroomGame["price"] | undefined, locale: string): string | undefined {
	if (!price) return undefined;

	return new Intl.NumberFormat(locale, { currency: price.currency, style: "currency" }).format(price.minorUnitAmount / 100);
}

export function ClassroomGameList({ classroomGameList }: { classroomGameList: ClassroomGame[] }) {
	const locale = useLocale();
	const t = useTranslations("library");
	const [redeemingClassroomGameId, setRedeemingClassroomGameId] = useState<string>();
	const session = useAuthGetSessionQuery();
	const library = useGetUserLibraryQuery(undefined, { skip: !session.data });
	const licenseStateReady = !session.isLoading && (!session.data || (!library.isLoading && !library.error));

	return (
		<div className={styles.classroomGameList}>
			{classroomGameList.map((classroomGame) => {
				const licenseList = (library.data?.itemList ?? []).filter(
					(item) => item.game.id === classroomGame.game.id && item.gameVersion.id === classroomGame.gameVersionId && item.classroom?.id === classroomGame.classroom.id,
				);
				const activeLicense = licenseList.find((item) => item.isActive);
				const institutionFunded = classroomGame.designatedPayor === "institution";
				return (
					<article className={styles.classroomGameItem} key={classroomGame.id}>
						<div className={styles.classroomGameMain}>
							<div className={styles.classroomGameHeading}>
								<div>
									<p className={styles.eyebrow}>{getGameTagList(classroomGame.game).join(" · ")}</p>
									<h3>{classroomGame.game.title}</h3>
								</div>
							</div>
							<p className={styles.classroomGameDescription}>{classroomGame.game.description ?? classroomGame.game.summary}</p>
							<div className={styles.classroomGameTags}>
								{getGameTagList(classroomGame.game).map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
							</div>
							<div className={styles.classroomGameFacts}>
								<span><Clock3 aria-hidden="true"/>{formatEstimatedLength(classroomGame.game, locale) ?? t("lengthVaries")}</span>
								<span>{formatOfferLanguage(classroomGame.language ?? "en", locale)} · {formatOfferMode(classroomGame.mode ?? "default")}</span>
								<span>{institutionFunded ? t("institutionFunded") : t("studentPaid")}{!institutionFunded && formatPrice(classroomGame.price, locale) ? ` · ${formatPrice(classroomGame.price, locale)}` : ""}</span>
								<span>{t("validRange", { start: formatDateTime(classroomGame.startAt, locale), end: formatDateTime(classroomGame.endAt, locale) })}</span>
							</div>
						</div>
						<div className={styles.classroomGameAction}>
							{redeemingClassroomGameId === classroomGame.id ? <ClassroomGameCodeRedemption classroomGameId={classroomGame.id} onCancel={() => setRedeemingClassroomGameId(undefined)}/> : null}
							{activeLicense ? <Badge><CheckCircle2 data-icon="inline-start"/>{t("inLibrary")}</Badge> : licenseList.length ? <Badge variant="outline">{t("inLibraryExpired")}</Badge> : null}
							{!activeLicense && licenseStateReady && institutionFunded ? (
								<Button onClick={() => setRedeemingClassroomGameId(classroomGame.id)} size="sm" type="button" variant="outline">
									<KeyRound data-icon="inline-start"/>{t("redeemCode")}
								</Button>
							) : null}
							{!activeLicense && licenseStateReady && !institutionFunded ? (
								<Link className={buttonVariants({ size: "sm" })} href={`/classroom-game/${classroomGame.id}/acquire`}>
									<MonitorPlay data-icon="inline-start"/>{t("acquire")}
								</Link>
							) : null}
						</div>
					</article>
				);
			})}
		</div>
	);
}