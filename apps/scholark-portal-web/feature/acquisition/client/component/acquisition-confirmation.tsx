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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import styles from "../../../../asset/style/acquisition.module.css";
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
		return <main className={styles.page}><p>Checking your account...</p></main>;
	}

	if (activeLicense) {
		return (
			<main className={styles.page}>
				<p className={styles.kicker}>Already acquired</p>
				<h1>{game.title} is already in your library.</h1>
				<p className={styles.detail}>This version has an active license in your library.</p>
				<Link className={buttonVariants({ size: "lg" })} href="/library"><Library data-icon="inline-start"/>Go to your library</Link>
			</main>
		);
	}

	return (
		<main className={styles.page}>
			<p className={styles.kicker}>Acquire game</p>
			<h1>Ready to add this game to your library?</h1>
			<section className={styles.summary}>
				{game.cover ? <div className={styles.cover}><Image alt="" fill sizes="180px" src={game.cover.src}/></div> : null}
				<div><p className={styles.kicker}>Selected game</p><h2>{game.title}</h2><p>{game.summary}</p><p>Version {gameVersion.publisherVersion}</p><p>{publicOffer.language} · {formatOfferMode(publicOffer.mode)} · {formatOfferPrice(publicOffer)}</p></div>
			</section>
			<p className={styles.detail}>You will complete payment securely with Stripe before this game is added to your library.</p>
			{acquisition.error ? <Alert variant="destructive"><AlertTitle>Unable to acquire game</AlertTitle><AlertDescription>{getApiErrorMessage(acquisition.error)}</AlertDescription></Alert> : null}
			<div className={styles.actions}>
				<Button disabled={acquisition.isLoading} onClick={confirm} size="lg" type="button">
					{acquisition.isLoading ? <LoaderCircle className="animate-spin" data-icon="inline-start"/> : <CheckCircle2 data-icon="inline-start"/>}
					Confirm acquisition
				</Button>
				<Button onClick={() => router.replace(`/game/${game.slug}`)} type="button" variant="outline">Cancel</Button>
			</div>
		</main>
	);
}
