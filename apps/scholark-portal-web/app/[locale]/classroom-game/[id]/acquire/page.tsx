import { notFound } from "next/navigation";

import { ClassroomGameAcquisitionConfirmation } from "../../../../../feature/acquisition/client/component/classroom-game-acquisition-confirmation";
import { getClassroomGameRequest } from "../../../../../feature/catalog/server/request/education.request";

export default async function AcquireClassroomGamePage({ params }: { params: Promise<{ id: string }> }) {
	const classroomGame = await getClassroomGameRequest((await params).id);
	if (!classroomGame) notFound();
	return <ClassroomGameAcquisitionConfirmation classroomGame={classroomGame}/>;
}