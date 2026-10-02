"use client";

import { buttonVariants } from "@repo/ui/button";
import { CheckCircle2, Library } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import styles from "../../../../asset/style/acquisition.module.css";
import { Link } from "../../../../i18n/navigation";
import type { Game } from "../../../catalog/shared/model/game";
import { useGetCheckoutStatusQuery } from "../api/acquisition-api";

export function AcquisitionSuccess({ game }: { game: Game }) {
	const t = useTranslations("acquisition");
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
		return <main className={styles.page}><p className={styles.kicker}>{t("invalidCheckout")}</p><h1>{t("paymentNotFound")}</h1><p className={styles.detail}>{t("returnToGameRetry")}</p></main>;
	}
	if (status.data?.status === "pending" || status.isLoading || !status.data && !status.isError) {
		return <main className={styles.page}><p className={styles.kicker}>{t("paymentProcessing")}</p><h1>{t("confirmingPayment")}</h1><p className={styles.detail}>{t("gamePaymentPending")}</p></main>;
	}
	if (status.data?.status === "failed" || status.isError) {
		return <main className={styles.page}><p className={styles.kicker}>{t("acquisitionIncomplete")}</p><h1>{t("paymentCouldNotConfirm")}</h1><p className={styles.detail}>{t("returnToGameRetry")}</p></main>;
	}

	return (
		<main className={styles.page}>
			<CheckCircle2 className={styles.successIcon} aria-hidden="true"/>
			<p className={styles.kicker}>{t("acquisitionComplete")}</p>
			<h1>{t("gameNowInLibrary", { gameTitle: game.title })}</h1>
			<p className={styles.detail}>{t("gameAccessReady")}</p>
			<Link className={buttonVariants({ size: "lg" })} href="/library"><Library data-icon="inline-start"/>{t("goToLibrary")}</Link>
		</main>
	);
}
