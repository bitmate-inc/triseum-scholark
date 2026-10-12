import { notFound } from "next/navigation";

import { AcquisitionConfirmation } from "../../../../../feature/acquisition/client/component/acquisition-confirmation";
import { getGameRequest } from "../../../../../feature/catalog/server/request/get-game.request";

export default async function AcquireGamePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ listing?: string }> }) {
	const { slug } = await params;
	const { listing: listingId } = await searchParams;
	const game = await getGameRequest(slug);
	if (!game) notFound();
	const gameVersion = game.gameVersionList.find(({ publicListingList }) => publicListingList.some(({ id }) => id === listingId));
	const publicListing = gameVersion?.publicListingList.find(({ id }) => id === listingId);
	if (!gameVersion || !publicListing) notFound();
	return <AcquisitionConfirmation game={game} gameVersion={gameVersion} publicListing={publicListing}/>;
}
