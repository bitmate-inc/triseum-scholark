import { notFound } from "next/navigation";

import {
	ClassroomGameListingAcquisitionConfirmation,
} from "../../../../../feature/acquisition/client/component/classroom-game-listing-acquisition-confirmation";
import { getClassroomGameListingRequest } from "../../../../../feature/catalog/server/request/education.request";

export default async function AcquireClassroomGameListingPage({ params }: { params: Promise<{ id: string }> }) {
	const classroomGameListing = await getClassroomGameListingRequest((await params).id);
	if (!classroomGameListing) notFound();
	return <ClassroomGameListingAcquisitionConfirmation classroomGameListing={classroomGameListing}/>;
}