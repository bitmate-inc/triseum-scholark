import { notFound } from "next/navigation";

import { AcquisitionConfirmation } from "../../../../feature/acquisition/client/component/acquisition-confirmation";
import { getGameRequest } from "../../../../feature/catalog/server/request/get-game.request";

export default async function AcquireGamePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ offer?: string }> }) {
	const { slug } = await params;
	const { offer: offerId } = await searchParams;
	const game = await getGameRequest(slug);
	if (!game) notFound();
	const gameVersion = game.gameVersionList.find(({ publicOfferList }) => publicOfferList.some(({ id }) => id === offerId));
	const publicOffer = gameVersion?.publicOfferList.find(({ id }) => id === offerId);
	if (!gameVersion || !publicOffer) notFound();
	return <AcquisitionConfirmation game={game} gameVersion={gameVersion} publicOffer={publicOffer}/>;
}
