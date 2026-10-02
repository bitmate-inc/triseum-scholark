"use client";

import {
	Alert,
	AlertDescription,
	AlertTitle
} from "@repo/ui/alert";
import { Button, buttonVariants } from "@repo/ui/button";
import {
	CheckCircle2,
	Library,
	LoaderCircle,
} from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";

import styles from "../../../../asset/style/acquisition.module.css";
import { Link , useRouter } from "../../../../i18n/navigation";
import { useAuthGetSessionQuery } from "../../../api/client/api/generated-api";
import { getApiErrorMessage } from "../../../auth/client/lib/api-error";
import {
	formatOfferMode,
	formatOfferPrice,
	type Game,
	type GameVersion,
	type PublicGameOffer,
} from "../../../catalog/shared/model/game";
import { useGetUserLibraryQuery } from "../../../library/client/api/library-api";
import { useAcquireGameMutation } from "../api/acquisition-api";

export function AcquisitionConfirmation({ game, gameVersion, publicOffer }: { game: Game; gameVersion: GameVersion; publicOffer: PublicGameOffer }) {
	const locale = useLocale();
	const t = useTranslations("acquisition");
	const router = useRouter();
	const session = useAuthGetSessionQuery();
	const library = useGetUserLibraryQuery(undefined, { skip: !session.data });
	const [acquire, acquisition] = useAcquireGameMutation();
	const activeLicense = library.data?.itemList.find(
		(item) => item.isActive && item.gameVersion.id === gameVersion.id && item.gameVariant.id === publicOffer.gameVariantId,
	);

	useEffect(() => {
		if (!session.isLoading && (!session.data || session.isError)) {
			const backTo = `/game/${game.slug}/acquire?offer=${publicOffer.id}`;
			const query = new URLSearchParams({ backTo });
			router.replace(`/auth/login?${query.toString()}`);
		}
	}, [game.slug, publicOffer.id, router, session.data, session.isError, session.isLoading]);

	async function confirm() {
		if (activeLicense) {
			return;
		}

		const response = await acquire(publicOffer.id);

		if ("data" in response && response.data) {
			window.location.assign(response.data.checkoutUrl);
		}
	}

	if (session.isLoading || !session.data || library.isLoading) {
		return <main className={styles.page}><p>{t("checkingAccount")}</p></main>;
	}

	if (activeLicense) {
		return (
			<main className={styles.page}>
				<p className={styles.kicker}>{t("alreadyAcquired")}</p>
				<h1>{t("gameAlreadyInLibrary", { gameTitle: game.title })}</h1>
				<p className={styles.detail}>{t("activeGameLicense")}</p>
				<Link className={buttonVariants({ size: "lg" })} href="/library"><Library data-icon="inline-start"/>{t("goToLibrary")}</Link>
			</main>
		);
	}

	return (
		<main className={styles.page}>
			<p className={styles.kicker}>{t("acquireGame")}</p>
			<h1>{t("readyToAddGame")}</h1>
			<section className={styles.summary}>
				{game.cover ? <div className={styles.cover}><Image alt="" fill sizes="180px" src={game.cover.src}/></div> : null}
				<div><p className={styles.kicker}>{t("selectedGame")}</p><h2>{game.title}</h2><p>{game.summary}</p><p>{t("version", { version: gameVersion.publisherVersion })}</p><p>{publicOffer.language} · {formatOfferMode(publicOffer.mode)} · {formatOfferPrice(publicOffer, locale)}</p></div>
			</section>
			<p className={styles.detail}>{t("gameStripeDetail")}</p>
			{acquisition.error ? <Alert variant="destructive"><AlertTitle>{t("gameAcquireError")}</AlertTitle><AlertDescription>{getApiErrorMessage(acquisition.error, { generic: t("genericApiError"), request: t("requestApiError") })}</AlertDescription></Alert> : null}
			<div className={styles.actions}>
				<Button disabled={acquisition.isLoading} onClick={confirm} size="lg" type="button">
					{acquisition.isLoading ? <LoaderCircle className="animate-spin" data-icon="inline-start"/> : <CheckCircle2 data-icon="inline-start"/>}
					{t("confirmAcquisition")}
				</Button>
				<Button onClick={() => router.replace(`/game/${game.slug}`)} type="button" variant="outline">{t("cancel")}</Button>
			</div>
		</main>
	);
}
