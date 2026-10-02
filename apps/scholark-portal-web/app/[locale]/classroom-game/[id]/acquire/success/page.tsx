import { notFound } from "next/navigation";

import { ClassroomGameAcquisitionSuccess } from "../../../../../../feature/acquisition/client/component/classroom-game-acquisition-success";
import { getClassroomGameRequest } from "../../../../../../feature/catalog/server/request/education.request";
import { ProtectedLibrary } from "../../../../../../feature/library/client/component/protected-library";

export default async function ClassroomGameAcquisitionSuccessPage({ params }: { params: Promise<{ id: string }> }) {
	const classroomGame = await getClassroomGameRequest((await params).id);
	if (!classroomGame) notFound();
	return <ProtectedLibrary><ClassroomGameAcquisitionSuccess classroomGame={classroomGame}/></ProtectedLibrary>;
}