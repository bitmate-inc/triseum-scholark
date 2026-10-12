import { notFound } from "next/navigation";

import { ClassroomGameListingAcquisitionSuccess } from "../../../../../../feature/acquisition/client/component/classroom-game-listing-acquisition-success";
import { getClassroomGameListingRequest } from "../../../../../../feature/catalog/server/request/education.request";
import { ProtectedLibrary } from "../../../../../../feature/library/client/component/protected-library";

export default async function ClassroomGameListingAcquisitionSuccessPage({ params }: { params: Promise<{ id: string }> }) {
	const classroomGameListing = await getClassroomGameListingRequest((await params).id);
	if (!classroomGameListing) notFound();
	return <ProtectedLibrary><ClassroomGameListingAcquisitionSuccess classroomGameListing={classroomGameListing}/></ProtectedLibrary>;
}