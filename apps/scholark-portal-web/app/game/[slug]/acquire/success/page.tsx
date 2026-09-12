import { notFound } from "next/navigation";

import { AcquisitionSuccess } from "../../../../../feature/acquisition/client/component/acquisition-success";
import { getGameRequest } from "../../../../../feature/catalog/server/request/get-game.request";
import { ProtectedLibrary } from "../../../../../feature/library/client/component/protected-library";

export default async function AcquisitionSuccessPage({ params }: { params: Promise<{ slug: string }> }) {
	const game = await getGameRequest((await params).slug);
	if (!game) notFound();
	return <ProtectedLibrary><AcquisitionSuccess game={game}/></ProtectedLibrary>;
}
