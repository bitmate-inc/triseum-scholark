"use client";

import { buttonVariants } from "@repo/ui/button";
import { CheckCircle2, Library } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import styles from "../../../../asset/style/acquisition.module.css";
import type { ClassroomGame } from "../../../catalog/shared/model/education";
import { useGetCheckoutStatusQuery } from "../api/acquisition-api";

export function ClassroomGameAcquisitionSuccess({ classroomGame }: { classroomGame: ClassroomGame }) {
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
		return <main className={styles.page}><p className={styles.kicker}>Invalid checkout</p><h1>We could not find this payment.</h1><p className={styles.detail}>Please return to the classroom and try again.</p></main>;
	}
	if (status.data?.status === "pending" || status.isLoading || !status.data && !status.isError) {
		return <main className={styles.page}><p className={styles.kicker}>Payment processing</p><h1>We are confirming your payment.</h1><p className={styles.detail}>Your classroom game will appear in the library as soon as Stripe confirms the payment.</p></main>;
	}
	if (status.data?.status === "failed" || status.isError) {
		return <main className={styles.page}><p className={styles.kicker}>Acquisition incomplete</p><h1>We could not confirm this payment.</h1><p className={styles.detail}>Please return to the classroom and try again.</p></main>;
	}

	return (
		<main className={styles.page}>
			<CheckCircle2 className={styles.successIcon} aria-hidden="true"/>
			<p className={styles.kicker}>Classroom acquisition complete</p>
			<h1>{classroomGame.game.title} is in your library.</h1>
			<p className={styles.detail}>Your license is linked to {classroomGame.classroom.name}, so your progress can be used for this classroom.</p>
			<div className={styles.actions}>
				<Link className={buttonVariants({ size: "lg" })} href="/library"><Library data-icon="inline-start"/>Go to your library</Link>
				<Link className={buttonVariants({ variant: "outline" })} href={`/classroom/${classroomGame.classroom.slug}`}>Return to classroom</Link>
			</div>
		</main>
	);
}