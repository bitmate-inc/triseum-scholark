"use client";

import { type ReactNode, useEffect } from "react";

import { useRouter } from "../../../../i18n/navigation";
import { useAuthGetSessionQuery } from "../../../api/client/api/generated-api";

export function ProtectedLibrary({ children }: { children: ReactNode }) {
	const router = useRouter();
	const session = useAuthGetSessionQuery();

	useEffect(() => {
		if (!session.isLoading && (!session.data || session.isError)) router.replace("/auth/login");
	}, [router, session.data, session.isError, session.isLoading]);

	if (session.isLoading || !session.data) return null;

	return children;
}