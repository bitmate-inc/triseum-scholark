"use client";

import {
	AlertCircle,
	CheckCircle2,
	Clock3,
	CreditCard,
	RefreshCw,
	XCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import styles from "../../../../asset/style/billing.module.css";
import { useAuthGetSessionQuery } from "../../../api/client/api/generated-api";
import {
	type PaymentAttempt,
	useGetPaymentAttemptsQuery,
	useRevalidatePaymentAttemptMutation
} from "../api/billing-api";

function formatDate(value: string): string {
	return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatPrice(attempt: PaymentAttempt): string {
	const formatter = new Intl.NumberFormat("en", { currency: attempt.price.currency, style: "currency" });
	const fractionDigits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
	return formatter.format(attempt.price.minorUnitAmount / 10 ** fractionDigits);
}

function statusLabel(status: PaymentAttempt["status"]): string {
	if (status === "fulfilled") return "Paid";
	if (status === "failed") return "Not completed";
	return "Pending";
}

export function BillingPageContent() {
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
				? "Payment confirmed. Your game is ready in the library."
				: result.status === "failed"
					? "Stripe confirmed this payment did not complete."
					: "Stripe has not confirmed the payment yet. Check again shortly.";
			setFeedback({ attemptId: attempt.id, message });
		} catch {
			setFeedback({ attemptId: attempt.id, message: "We could not check this payment. Please try again." });
		}
	}

	if (session.isLoading || !session.data) {
		return <main className={styles.page}><div className={styles.state}><RefreshCw className={styles.spin} aria-hidden="true"/><p>Loading your billing history...</p></div></main>;
	}

	const attemptList = data?.itemList ?? [];

	return (
		<main className={styles.page}>
			<header className={styles.intro}>
				<p className={styles.kicker}>Account</p>
				<h1>Billing</h1>
				<p>Review your game payments and check any payment that is still processing.</p>
			</header>

			{isLoading ? (
				<div className={styles.state}><RefreshCw className={styles.spin} aria-hidden="true"/><p>Loading your payment attempts...</p></div>
			) : error ? (
				<div className={styles.state} role="alert"><AlertCircle aria-hidden="true"/><h2>Billing history unavailable</h2><p>We could not load your payment attempts.</p><button className={styles.textButton} onClick={() => void refetch()} type="button">Try again</button></div>
			) : attemptList.length === 0 ? (
				<div className={styles.state}><CreditCard aria-hidden="true"/><h2>No payment attempts</h2><p>Payments for games you acquire will appear here.</p></div>
			) : (
				<section className={styles.history} aria-label="Payment attempts">
					<div className={styles.historyHeading}><h2>Payment history</h2><span>{attemptList.length} {attemptList.length === 1 ? "payment" : "payments"}</span></div>
					<div className={styles.list}>
						{attemptList.map((attempt) => (
							<article className={styles.attempt} key={attempt.id}>
								<div className={styles.attemptIcon} aria-hidden="true">
									{attempt.status === "fulfilled" ? <CheckCircle2/> : attempt.status === "failed" ? <XCircle/> : <Clock3/>}
								</div>
								<div className={styles.details}>
									<div className={styles.titleLine}><h3>{attempt.gameTitle}</h3><span className={`${styles.status} ${styles[attempt.status]}`}>{statusLabel(attempt.status)}</span></div>
									<dl className={styles.facts}>
										<div><dt>Amount</dt><dd>{formatPrice(attempt)}</dd></div>
										<div><dt>Started</dt><dd>{formatDate(attempt.createdAt)}</dd></div>
										{attempt.fulfilledAt ? <div><dt>Paid</dt><dd>{formatDate(attempt.fulfilledAt)}</dd></div> : null}
									</dl>
									{feedback?.attemptId === attempt.id ? <p className={styles.feedback} aria-live="polite">{feedback.message}</p> : null}
								</div>
								{attempt.canRevalidate ? (
									<button className={styles.revalidateButton} disabled={revalidation.isLoading} onClick={() => void handleRevalidate(attempt)} type="button">
										<RefreshCw aria-hidden="true"/>{revalidation.isLoading ? "Checking..." : "Check / resume checkout"}
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