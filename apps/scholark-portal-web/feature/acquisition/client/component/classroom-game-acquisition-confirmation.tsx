"use client";

import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@repo/ui/alert";
import { Button } from "@repo/ui/button";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import styles from "../../../../asset/style/acquisition.module.css";
import { useAuthGetSessionQuery } from "../../../api/client/api/generated-api";
import { getApiErrorMessage } from "../../../auth/client/lib/api-error";
import type { ClassroomGame } from "../../../catalog/shared/model/education";
import { useAcquireClassroomGameMutation } from "../api/acquisition-api";

export function ClassroomGameAcquisitionConfirmation({ classroomGame }: { classroomGame: ClassroomGame }) {
	const router = useRouter();
	const session = useAuthGetSessionQuery();
	const [acquire, acquisition] = useAcquireClassroomGameMutation();

	useEffect(() => {
		if (!session.isLoading && (!session.data || session.isError)) {
			router.replace("/auth/login");
		}
	}, [router, session.data, session.isError, session.isLoading]);

	async function confirm() {
		const response = await acquire(classroomGame.id);
		if ("data" in response) {
			router.replace(`/classroom-game/${classroomGame.id}/acquire/success`);
		}
	}

	if (session.isLoading || !session.data) {
		return <main className={styles.page}><p>Checking your account...</p></main>;
	}

	const accessDuration = `${classroomGame.licenseDurationDays} day${classroomGame.licenseDurationDays === 1 ? "" : "s"}`;

	return (
		<main className={styles.page}>
			<p className={styles.kicker}>For-credit acquisition</p>
			<h1>Add this classroom game to your library?</h1>
			<section className={styles.summary}>
				{classroomGame.game.cover ? <div className={styles.cover}><Image alt="" fill sizes="180px" src={classroomGame.game.cover.src}/></div> : null}
				<div><p className={styles.kicker}>{classroomGame.classroom.name}</p><h2>{classroomGame.game.title}</h2><p>{classroomGame.game.summary}</p></div>
			</section>
			<p className={styles.detail}>This for-credit license provides {accessDuration} of access and records your classroom progress.</p>
			{acquisition.error ? <Alert variant="destructive"><AlertTitle>Unable to acquire classroom game</AlertTitle><AlertDescription>{getApiErrorMessage(acquisition.error)}</AlertDescription></Alert> : null}
			<div className={styles.actions}>
				<Button disabled={acquisition.isLoading} onClick={confirm} size="lg" type="button">
					{acquisition.isLoading ? <LoaderCircle className="animate-spin" data-icon="inline-start"/> : <CheckCircle2 data-icon="inline-start"/>}
					Confirm acquisition
				</Button>
				<Button onClick={() => router.back()} type="button" variant="outline">Cancel</Button>
			</div>
		</main>
	);
}