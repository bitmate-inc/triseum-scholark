import { notFound } from "next/navigation";

import { InstructorClassroomView } from "../../../../../feature/instructor/client/component/instructor-classroom-view";
import { isLocale } from "../../../../../i18n/routing";

export default async function InstructorClassroomPage({
	params,
}: {
	params: Promise<{ classroomId: string; locale: string }>;
}) {
	const { classroomId, locale } = await params;
	if (!isLocale(locale)) notFound();

	return <InstructorClassroomView classroomId={classroomId}/>;
}