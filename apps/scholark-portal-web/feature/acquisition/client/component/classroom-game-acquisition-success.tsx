"use client";

import { buttonVariants } from "@repo/ui/button";
import { CheckCircle2, Library } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import styles from "../../../../asset/style/acquisition.module.css";
import { Link } from "../../../../i18n/navigation";
import type { ClassroomGame } from "../../../catalog/shared/model/education";
import { useGetCheckoutStatusQuery } from "../api/acquisition-api";

export function ClassroomGameAcquisitionSuccess({ classroomGame }: { classroomGame: ClassroomGame }) {
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
		return <main className={styles.page}><p className={styles.kicker}>{t("invalidCheckout")}</p><h1>{t("paymentNotFound")}</h1><p className={styles.detail}>{t("returnToClassroomRetry")}</p></main>;
	}
	if (status.data?.status === "pending" || status.isLoading || !status.data && !status.isError) {
		return <main className={styles.page}><p className={styles.kicker}>{t("paymentProcessing")}</p><h1>{t("confirmingPayment")}</h1><p className={styles.detail}>{t("classroomPaymentPending")}</p></main>;
	}
	if (status.data?.status === "failed" || status.isError) {
		return <main className={styles.page}><p className={styles.kicker}>{t("acquisitionIncomplete")}</p><h1>{t("paymentCouldNotConfirm")}</h1><p className={styles.detail}>{t("returnToClassroomRetry")}</p></main>;
	}

	return (
		<main className={styles.page}>
			<CheckCircle2 className={styles.successIcon} aria-hidden="true"/>
			<p className={styles.kicker}>{t("classroomAcquisitionComplete")}</p>
			<h1>{t("gameNowInLibrary", { gameTitle: classroomGame.game.title })}</h1>
			<p className={styles.detail}>{t("classroomLicenseLinked", { classroomName: classroomGame.classroom.name })}</p>
			<div className={styles.actions}>
				<Link className={buttonVariants({ size: "lg" })} href="/library"><Library data-icon="inline-start"/>{t("goToLibrary")}</Link>
				<Link className={buttonVariants({ variant: "outline" })} href={`/classroom/${classroomGame.classroom.slug}`}>{t("returnToClassroom")}</Link>
			</div>
		</main>
	);
}