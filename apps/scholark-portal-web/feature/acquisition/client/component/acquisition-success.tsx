import { buttonVariants } from "@repo/ui/button";
import { CheckCircle2, Library } from "lucide-react";
import Link from "next/link";

import styles from "../../../../asset/style/acquisition.module.css";
import type { Game } from "../../../catalog/shared/model/game";

export function AcquisitionSuccess({ game }: { game: Game }) {
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
