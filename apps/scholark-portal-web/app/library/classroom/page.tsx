import type { Metadata } from "next";

import { LibraryPageContent } from "../library-page-content";

export const metadata: Metadata = {
	description: "Classroom games, access windows, and progress in your ScholArk library.",
	title: "Classroom games · ScholArk",
};

export default function ClassroomLibraryPage() {
	return <LibraryPageContent mode="classroom"/>;
}