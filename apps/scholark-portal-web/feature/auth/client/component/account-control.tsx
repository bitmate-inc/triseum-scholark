"use client";

import { Button, buttonVariants } from "@repo/ui/button";
import { LogOut, UserRound } from "lucide-react";
import Link from "next/link";

import { useAuthGetSessionQuery, useAuthLogoutMutation } from "../../../api/client/api/generated-api";

export function AccountControl() {
	const user = useAuthGetSessionQuery();
	const [logout, logoutResult] = useAuthLogoutMutation();

	async function signOut() {
		const response = await logout();
		if ("data" in response) window.location.assign("/");
	}

	if (!user.data) {
		return (
			<Link className={buttonVariants({ variant: "outline", size: "sm" })} href="/auth/login">
				<UserRound data-icon="inline-start"/>
				Sign in
			</Link>
		);
	}

	return (
		<>
			<Link className={buttonVariants({ variant: "outline", size: "sm" })} href="/profile">
				<UserRound data-icon="inline-start"/>
				Profile
			</Link>
			<Button aria-label="Sign out" disabled={logoutResult.isLoading} onClick={signOut} size="icon" variant="ghost">
				<LogOut/>
			</Button>
		</>
	);
}