import { notFound } from "next/navigation";

import { AcquisitionConfirmation } from "../../../../../feature/acquisition/client/component/acquisition-confirmation";
import { getGameRequest } from "../../../../../feature/catalog/server/request/get-game.request";

export default async function AcquireGamePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ language?: string; listing?: string }> }) {
	const { slug } = await params;
	const { language, listing: listingId } = await searchParams;
	const game = await getGameRequest(slug);
	if (!game) notFound();
	const gameVersion = game.gameVersionList.find(({ publicListingList }) => publicListingList.some(({ id }) => id === listingId));
	const publicListing = gameVersion?.publicListingList.find(({ id }) => id === listingId);
	const priceGroup = publicListing?.priceGroupList.find((group) => group.languageList.includes(language ?? ""));
	if (!gameVersion || !publicListing || !language || !priceGroup) notFound();
	return <AcquisitionConfirmation game={game} gameVersion={gameVersion} language={language} price={priceGroup.price} publicListing={publicListing}/>;
}
