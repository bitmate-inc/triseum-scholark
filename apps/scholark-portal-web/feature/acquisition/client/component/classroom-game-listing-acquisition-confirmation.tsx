"use client";

import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@repo/ui/alert";
import { Button, buttonVariants } from "@repo/ui/button";
import {
	CheckCircle2,
	Library,
	LoaderCircle,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import styles from "../../../../asset/style/acquisition.module.css";
import { Link, useRouter } from "../../../../i18n/navigation";
import { useAuthGetSessionQuery } from "../../../api/client/api/generated-api";
import { getApiErrorMessage } from "../../../auth/client/lib/api-error";
import type { ClassroomGameListing } from "../../../catalog/shared/model/education";
import { useGetUserLibraryQuery } from "../../../library/client/api/library-api";
import { useAcquireClassroomGameListingMutation } from "../api/acquisition-api";

export function ClassroomGameListingAcquisitionConfirmation({ classroomGameListing }: { classroomGameListing: ClassroomGameListing }) {
	const t = useTranslations("acquisition");
	const router = useRouter();
	const session = useAuthGetSessionQuery();
	const library = useGetUserLibraryQuery(undefined, { skip: !session.data });
	const [acquire, acquisition] = useAcquireClassroomGameListingMutation();
	const activeLicense = library.data?.itemList.find(
		(item) => item.isActive && item.classroomGameListingId === classroomGameListing.id,
	);

	useEffect(() => {
		if (!session.isLoading && (!session.data || session.isError)) {
			router.replace("/auth/login");
		}
	}, [router, session.data, session.isError, session.isLoading]);

	async function confirm() {
		if (activeLicense) {
			return;
		}

		const response = await acquire(classroomGameListing.id);
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
				<h1>{t("classroomGameAlreadyInLibrary")}</h1>
				<p className={styles.detail}>{t("classroomLicenseActive")}</p>
				<div className={styles.actions}>
					<Link className={buttonVariants({ size: "lg" })} href="/library"><Library data-icon="inline-start"/>{t("goToLibrary")}</Link>
					<Link className={buttonVariants({ variant: "outline" })} href={`/classroom/${classroomGameListing.classroom.slug}`}>{t("returnToClassroom")}</Link>
				</div>
			</main>
		);
	}

	return (
		<main className={styles.page}>
			<p className={styles.kicker}>{t("forCreditAcquisition")}</p>
			<h1>{t("addClassroomGame")}</h1>
			<section className={styles.summary}>
				{classroomGameListing.game.cover ? <div className={styles.cover}><Image alt="" fill sizes="180px" src={classroomGameListing.game.cover.src}/></div> : null}
				<div><p className={styles.kicker}>{classroomGameListing.classroom.name}</p><h2>{classroomGameListing.game.title}</h2><p>{classroomGameListing.game.summary}</p></div>
			</section>
			<p className={styles.detail}>{t("classroomStripeDetail", { days: classroomGameListing.licenseDurationDays })}</p>
			{acquisition.error ? <Alert variant="destructive"><AlertTitle>{t("classroomAcquireError")}</AlertTitle><AlertDescription>{getApiErrorMessage(acquisition.error, { generic: t("genericApiError"), request: t("requestApiError") })}</AlertDescription></Alert> : null}
			<div className={styles.actions}>
				<Button disabled={acquisition.isLoading} onClick={confirm} size="lg" type="button">
					{acquisition.isLoading ? <LoaderCircle className="animate-spin" data-icon="inline-start"/> : <CheckCircle2 data-icon="inline-start"/>}
					{t("confirmAcquisition")}
				</Button>
				<Button onClick={() => router.back()} type="button" variant="outline">{t("cancel")}</Button>
			</div>
		</main>
	);
}