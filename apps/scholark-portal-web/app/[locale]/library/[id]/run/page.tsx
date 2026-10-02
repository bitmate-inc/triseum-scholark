import { ProtectedLibrary } from "../../../../../feature/library/client/component/protected-library";
import { RunGameView } from "../../../../../feature/library/client/component/run-game-view";

export default async function RunGamePage({ params }: { params: Promise<{ id: string }> }) {
	return <ProtectedLibrary><RunGameView id={(await params).id}/></ProtectedLibrary>;
}
