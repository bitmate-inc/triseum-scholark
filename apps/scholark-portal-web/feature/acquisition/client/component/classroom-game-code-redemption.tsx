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
import { useTranslations } from "next-intl";
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
	const t = useTranslations("acquisition");
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
				<AlertTitle>{t("codeRedeemed")}</AlertTitle>
				<AlertDescription>{t("institutionAccessActive")}</AlertDescription>
			</Alert>
		);
	}

	return (
		<form className={styles.classroomGameAction} onSubmit={submit}>
			<label htmlFor={`acquisition-code-${classroomGameId}`}>{t("acquisitionCode")}</label>
			<input
				aria-label={t("acquisitionCode")}
				id={`acquisition-code-${classroomGameId}`}
				onChange={(event) => setCode(event.target.value)}
				placeholder={t("enterCode")}
				value={code}
			/>
			{redemption.error ? <Alert variant="destructive"><AlertTitle>{t("codeRedemptionFailed")}</AlertTitle><AlertDescription>{getApiErrorMessage(redemption.error, { generic: t("genericApiError"), request: t("requestApiError") })}</AlertDescription></Alert> : null}
			<div>
				<Button disabled={redemption.isLoading || !code.trim()} size="sm" type="submit">
					{redemption.isLoading ? <LoaderCircle className="animate-spin" data-icon="inline-start"/> : <KeyRound data-icon="inline-start"/>}
					{t("redeem")}
				</Button>
				<Button disabled={redemption.isLoading} onClick={onCancel} size="sm" type="button" variant="outline">{t("cancel")}</Button>
			</div>
		</form>
	);
}
