import { useState } from "react"
import AddGame from "../components/AddGame"
import CardGrid from "../components/CardGrid"
import NavBar from "../components/NavBar"
import Terminal from "../components/Terminal"

export default function Home() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [isAddingGame, setIsAddingGame] = useState(false);
    const [isAddGameOpen, setIsAddGameOpen] = useState(false);
    const [addGameError, setAddGameError] = useState("");

    const refreshLibrary = () => {
        setRefreshKey((prev) => prev + 1);
    };

    const openAddGame = () => {
        setAddGameError("");
        setIsAddGameOpen(true);
    };

    const closeAddGame = () => {
        if (isAddingGame) {
            return;
        }
        setAddGameError("");
        setIsAddGameOpen(false);
    };

    const addGameFromBridge = async ({ name, exePath, savePath }) => {
        const api = window.pywebview?.api;
        if (typeof api?.add_game !== "function") {
            setAddGameError("Add game is only available when running inside the Python launcher.");
            return;
        }

        setIsAddingGame(true);
        setAddGameError("");
        try {
            const result = await api.add_game(name, exePath, savePath);
            if (result?.status?.toLowerCase() === "error") {
                setAddGameError(result?.message || "Failed to add game.");
                return;
            }
            setIsAddGameOpen(false);
            refreshLibrary();
        } catch (err) {
            console.error("Failed to add game", err);
            setAddGameError("Failed to add game via bridge API.");
        } finally {
            setIsAddingGame(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col overflow-x-hidden">
            <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#181211] dark group/design-root overflow-x-hidden"
                style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}
            >
                <div className="layout-container flex h-full grow flex-col pb-12">
                    <div className="px-4 md:px-10 flex flex-1 justify-center py-5">
                        <div className="layout-content-container flex flex-col w-full max-w-[1200px] flex-1">
                            <NavBar addDisabled={isAddingGame} onAddGame={openAddGame} onRefresh={refreshLibrary}></NavBar>
                            <CardGrid refreshKey={refreshKey}></CardGrid>
                        </div>
                    </div>
                </div>
            </div>

            <AddGame
                errorMessage={addGameError}
                isOpen={isAddGameOpen}
                isSubmitting={isAddingGame}
                onClose={closeAddGame}
                onSubmit={addGameFromBridge}
            />

            <Terminal></Terminal>
        </div>
    )
}