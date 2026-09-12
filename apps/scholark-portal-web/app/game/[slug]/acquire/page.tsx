import { notFound } from "next/navigation";

import { AcquisitionConfirmation } from "../../../../feature/acquisition/client/component/acquisition-confirmation";
import { getGameRequest } from "../../../../feature/catalog/server/request/get-game.request";

export default async function AcquireGamePage({ params }: { params: Promise<{ slug: string }> }) {
	const game = await getGameRequest((await params).slug);
	if (!game) notFound();
	return <AcquisitionConfirmation game={game}/>;
}
