import type { Metadata } from "next";

import { LibraryPageContent } from "../library-page-content";

export const metadata: Metadata = {
	description: "Standalone games and access windows in your ScholArk library.",
	title: "Standalone games · ScholArk",
};

export default function StandaloneLibraryPage() {
	return <LibraryPageContent mode="standalone"/>;
}