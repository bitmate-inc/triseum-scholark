import { notFound } from "next/navigation";

import { AcquisitionConfirmation } from "../../../../feature/acquisition/client/component/acquisition-confirmation";
import { getGameRequest } from "../../../../feature/catalog/server/request/get-game.request";

export default async function AcquireGamePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ version?: string }> }) {
	const { slug } = await params;
	const { version } = await searchParams;
	const game = await getGameRequest(slug);
	if (!game) notFound();
	const gameVersion = game.gameVersionList.find(({ id }) => id === version);
	if (!gameVersion) notFound();
	return <AcquisitionConfirmation game={game} gameVersion={gameVersion}/>;
}
