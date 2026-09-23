import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	description: "Your acquired ScholArk games, versions, and classroom assignments.",
	title: "Your library · ScholArk",
};

export default function LibraryPage() {
	redirect("/library/classroom");
}