import { useEffect, useState } from "react";
import Terminal from "../components/Terminal";
import GameDeetsHeader from "../components/game-details/GameDeetsHeader";
import GameDeetsSummary from "../components/game-details/GameDeetsSummary";
import GameDeetsInfoPanel from "../components/game-details/GameDeetsInfoPanel";

export default function GameDeets({ game, onBack, onGameUpdate }) {
    const [selectedGame, setSelectedGame] = useState(game || null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLaunching, setIsLaunching] = useState(false);
    const [refreshError, setRefreshError] = useState("");
    const [launchError, setLaunchError] = useState("");
    const [launchMessage, setLaunchMessage] = useState("");

    useEffect(() => {
        setSelectedGame(game || null);
    }, [game]);

    const updateGameFromLibrary = async () => {
        const api = window.pywebview?.api;
        if (typeof api?.get_library_with_status !== "function" || !selectedGame?.name) {
            return;
        }

        const library = await api.get_library_with_status();
        const match = Array.isArray(library)
            ? library.find((entry) => entry.name === selectedGame.name)
            : null;

        if (match) {
            setSelectedGame(match);
            if (typeof onGameUpdate === "function") {
                onGameUpdate(match);
            }
        }
    };

    const refreshStatus = async () => {
        setIsRefreshing(true);
        setRefreshError("");
        try {
            await updateGameFromLibrary();
        } catch (err) {
            setRefreshError("Failed to refresh status from backend.");
        } finally {
            setIsRefreshing(false);
        }
    };

    const launchGame = async () => {
        const api = window.pywebview?.api;
        if (typeof api?.launch_game !== "function" || !selectedGame?.name) {
            setLaunchError("Launch is only available in Python launcher mode.");
            return;
        }

        setIsLaunching(true);
        setLaunchError("");
        setLaunchMessage("");
        try {
            const result = await api.launch_game(selectedGame.name);
            if (result?.status?.toLowerCase() === "error") {
                setLaunchError(result?.message || "Failed to launch game.");
                return;
            }

            setLaunchMessage(result?.message || "Launch started.");
            await updateGameFromLibrary();
        } catch (err) {
            setLaunchError("Failed to trigger launch via bridge.");
        } finally {
            setIsLaunching(false);
        }
    };

    if (!selectedGame) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-dark text-slate-200">
                <div className="text-center">
                    <p className="font-display text-xl text-white mb-4">No game selected.</p>
                    <button
                        className="h-10 px-5 bg-primary text-white font-bold uppercase tracking-[0.05em] hover:bg-[#d9442a] transition-colors"
                        onClick={onBack}
                        type="button"
                    >
                        Back to Library
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col font-body relative overflow-x-hidden bg-background-dark text-slate-200">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#3a1510_0%,#111827_30%,#090D14_70%)] opacity-80"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-background-dark/40 via-background-dark/70 to-background-dark"></div>
            </div>

            <GameDeetsHeader onBack={onBack} />

            <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 pb-24 flex flex-col md:flex-row gap-8 items-start">
                <GameDeetsSummary
                    game={selectedGame}
                    isLaunching={isLaunching}
                    launchError={launchError}
                    launchMessage={launchMessage}
                    onLaunch={launchGame}
                />

                <GameDeetsInfoPanel
                    game={selectedGame}
                    isRefreshing={isRefreshing}
                    onRefreshStatus={refreshStatus}
                    refreshError={refreshError}
                />
            </main>

            <Terminal />
        </div>
    );
}
