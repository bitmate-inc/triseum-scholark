"use client";

import {
	AlertCircle,
	CheckCircle2,
	Clock3,
	CreditCard,
	RefreshCw,
	XCircle
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import styles from "../../../../asset/style/billing.module.css";
import { useRouter } from "../../../../i18n/navigation";
import { useAuthGetSessionQuery } from "../../../api/client/api/generated-api";
import {
	type PaymentAttempt,
	useGetPaymentAttemptsQuery,
	useRevalidatePaymentAttemptMutation
} from "../api/billing-api";

function formatDate(value: string, locale: string): string {
	return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatPrice(attempt: PaymentAttempt, locale: string): string {
	const formatter = new Intl.NumberFormat(locale, { currency: attempt.price.currency, style: "currency" });
	const fractionDigits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
	return formatter.format(attempt.price.minorUnitAmount / 10 ** fractionDigits);
}

function statusLabel(status: PaymentAttempt["status"], labels: Record<PaymentAttempt["status"], string>): string {
	return labels[status];
}

export function BillingPageContent() {
	const locale = useLocale();
	const t = useTranslations("billing");
	const router = useRouter();
	const session = useAuthGetSessionQuery();
	const { data, error, isLoading, refetch } = useGetPaymentAttemptsQuery(undefined, { skip: !session.data });
	const [revalidate, revalidation] = useRevalidatePaymentAttemptMutation();
	const [feedback, setFeedback] = useState<{ attemptId: string; message: string }>();

	useEffect(() => {
		if (!session.isLoading && (!session.data || session.isError)) {
			router.replace("/auth/login");
		}
	}, [router, session.data, session.isError, session.isLoading]);

	async function handleRevalidate(attempt: PaymentAttempt) {
		setFeedback(undefined);
		try {
			const result = await revalidate(attempt.id).unwrap();
			if (result.checkoutUrl) {
				window.location.assign(result.checkoutUrl);
				return;
			}
			const message = result.status === "fulfilled"
				? t("paymentConfirmed")
				: result.status === "failed"
					? t("paymentNotCompleted")
					: t("paymentStillPending");
			setFeedback({ attemptId: attempt.id, message });
		} catch {
			setFeedback({ attemptId: attempt.id, message: t("paymentCheckFailed") });
		}
	}

	if (session.isLoading || !session.data) {
		return <main className={styles.page}><div className={styles.state}><RefreshCw className={styles.spin} aria-hidden="true"/><p>{t("loadingHistory")}</p></div></main>;
	}

	const attemptList = data?.itemList ?? [];

	return (
		<main className={styles.page}>
			<header className={styles.intro}>
				<p className={styles.kicker}>{t("account")}</p>
				<h1>{t("title")}</h1>
				<p>{t("description")}</p>
			</header>

			{isLoading ? (
				<div className={styles.state}><RefreshCw className={styles.spin} aria-hidden="true"/><p>{t("loadingPayments")}</p></div>
			) : error ? (
				<div className={styles.state} role="alert"><AlertCircle aria-hidden="true"/><h2>{t("unavailable")}</h2><p>{t("loadFailed")}</p><button className={styles.textButton} onClick={() => void refetch()} type="button">{t("tryAgain")}</button></div>
			) : attemptList.length === 0 ? (
				<div className={styles.state}><CreditCard aria-hidden="true"/><h2>{t("noAttempts")}</h2><p>{t("noAttemptsDescription")}</p></div>
			) : (
				<section className={styles.history} aria-label={t("attemptsLabel")}>
					<div className={styles.historyHeading}><h2>{t("history")}</h2><span>{t("paymentCount", { count: attemptList.length })}</span></div>
					<div className={styles.list}>
						{attemptList.map((attempt) => (
							<article className={styles.attempt} key={attempt.id}>
								<div className={styles.attemptIcon} aria-hidden="true">
									{attempt.status === "fulfilled" ? <CheckCircle2/> : attempt.status === "failed" ? <XCircle/> : <Clock3/>}
								</div>
								<div className={styles.details}>
									<div className={styles.titleLine}><h3>{attempt.gameTitle}</h3><span className={`${styles.status} ${styles[attempt.status]}`}>{statusLabel(attempt.status, { fulfilled: t("paid"), failed: t("notCompleted"), pending: t("pending") })}</span></div>
									<dl className={styles.facts}>
										<div><dt>{t("amount")}</dt><dd>{formatPrice(attempt, locale)}</dd></div>
										<div><dt>{t("started")}</dt><dd>{formatDate(attempt.createdAt, locale)}</dd></div>
										{attempt.fulfilledAt ? <div><dt>{t("paidAt")}</dt><dd>{formatDate(attempt.fulfilledAt, locale)}</dd></div> : null}
									</dl>
									{feedback?.attemptId === attempt.id ? <p className={styles.feedback} aria-live="polite">{feedback.message}</p> : null}
								</div>
								{attempt.canRevalidate ? (
									<button className={styles.revalidateButton} disabled={revalidation.isLoading} onClick={() => void handleRevalidate(attempt)} type="button">
										<RefreshCw aria-hidden="true"/>{revalidation.isLoading ? t("checking") : t("checkResume")}
									</button>
								) : null}
							</article>
						))}
					</div>
				</section>
			)}
		</main>
	);
}