"use client";

import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@repo/ui/alert";
import { Button } from "@repo/ui/button";
import {
	CheckCircle2,
	KeyRound,
	LoaderCircle,
} from "lucide-react";
import { type FormEvent, useState } from "react";

import styles from "../../../../asset/style/site.module.css";
import { getApiErrorMessage } from "../../../auth/client/lib/api-error";
import { useRedeemAcquisitionCodeMutation } from "../api/acquisition-api";

export function ClassroomGameCodeRedemption({
	classroomGameId,
	onCancel,
}: {
	classroomGameId: string;
	onCancel: () => void;
}) {
	const [code, setCode] = useState("");
	const [redeem, redemption] = useRedeemAcquisitionCodeMutation();

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!code.trim()) {
			return;
		}

		await redeem({ classroomGameId, code: code.trim() });
	}

	if (redemption.data) {
		return (
			<Alert>
				<CheckCircle2 data-icon="inline-start"/>
				<AlertTitle>Game added to your library</AlertTitle>
				<AlertDescription>Your institution-funded access is now active.</AlertDescription>
			</Alert>
		);
	}

	return (
		<form className={styles.classroomGameAction} onSubmit={submit}>
			<label htmlFor={`acquisition-code-${classroomGameId}`}>Acquisition code</label>
			<input
				aria-label="Acquisition code"
				id={`acquisition-code-${classroomGameId}`}
				onChange={(event) => setCode(event.target.value)}
				placeholder="Enter code"
				value={code}
			/>
			{redemption.error ? <Alert variant="destructive"><AlertTitle>Code could not be redeemed</AlertTitle><AlertDescription>{getApiErrorMessage(redemption.error)}</AlertDescription></Alert> : null}
			<div>
				<Button disabled={redemption.isLoading || !code.trim()} size="sm" type="submit">
					{redemption.isLoading ? <LoaderCircle className="animate-spin" data-icon="inline-start"/> : <KeyRound data-icon="inline-start"/>}
					Redeem
				</Button>
				<Button disabled={redemption.isLoading} onClick={onCancel} size="sm" type="button" variant="outline">Cancel</Button>
			</div>
		</form>
	);
}
