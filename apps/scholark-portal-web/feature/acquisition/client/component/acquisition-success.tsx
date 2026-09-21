"use client";

import { buttonVariants } from "@repo/ui/button";
import { CheckCircle2, Library } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import styles from "../../../../asset/style/acquisition.module.css";
import type { Game } from "../../../catalog/shared/model/game";
import { useGetCheckoutStatusQuery } from "../api/acquisition-api";

export function AcquisitionSuccess({ game }: { game: Game }) {
	const checkoutSessionId = useSearchParams().get("checkout_session_id") ?? "";
	const status = useGetCheckoutStatusQuery(checkoutSessionId, {
		skip: !checkoutSessionId,
	});
	const checkoutStatus = status.data?.status;
	const { refetch } = status;

	useEffect(() => {
		if (!checkoutSessionId || checkoutStatus !== "pending") {
			return;
		}

		const timeout = window.setTimeout(() => void refetch(), 1500);
		return () => window.clearTimeout(timeout);
	}, [checkoutSessionId, checkoutStatus, refetch]);

	if (!checkoutSessionId) {
		return <main className={styles.page}><p className={styles.kicker}>Invalid checkout</p><h1>We could not find this payment.</h1><p className={styles.detail}>Please return to the game and try again.</p></main>;
	}
	if (status.data?.status === "pending" || status.isLoading || !status.data && !status.isError) {
		return <main className={styles.page}><p className={styles.kicker}>Payment processing</p><h1>We are confirming your payment.</h1><p className={styles.detail}>Your game will appear in the library as soon as Stripe confirms the payment.</p></main>;
	}
	if (status.data?.status === "failed" || status.isError) {
		return <main className={styles.page}><p className={styles.kicker}>Acquisition incomplete</p><h1>We could not confirm this payment.</h1><p className={styles.detail}>Please return to the game and try again.</p></main>;
	}

	return (
		<main className={styles.page}>
			<CheckCircle2 className={styles.successIcon} aria-hidden="true"/>
			<p className={styles.kicker}>Acquisition complete</p>
			<h1>{game.title} is in your library.</h1>
			<p className={styles.detail}>You now have access to the game and can launch it from your library.</p>
			<Link className={buttonVariants({ size: "lg" })} href="/library"><Library data-icon="inline-start"/>Go to your library</Link>
		</main>
	);
}
