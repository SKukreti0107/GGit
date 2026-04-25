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
    const [isRemoving, setIsRemoving] = useState(false);
    const [removeError, setRemoveError] = useState("");
    const [removeMessage, setRemoveMessage] = useState("");
    const [showRemoteRemovePrompt, setShowRemoteRemovePrompt] = useState(false);
    const [removedGameName, setRemovedGameName] = useState("");

    useEffect(() => {
        setSelectedGame(game || null);
    }, [game]);

    const updateGameFromLibrary = async (forceRefresh = false) => {
        const api = window.pywebview?.api;
        if (typeof api?.get_library_with_status !== "function" || !selectedGame?.name) {
            return;
        }

        const library = await api.get_library_with_status(forceRefresh);
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
            await updateGameFromLibrary(true);
        } catch (err) {
            setRefreshError("Failed to refresh status from backend.");
        } finally {
            setIsRefreshing(false);
        }
    };

    const removeGame = async () => {
        if (!selectedGame?.name) {
            setRemoveError("Remove is only available in Python launcher mode.");
            return;
        }

        setRemoveError("");
        setRemoveMessage("");
        setRemovedGameName(selectedGame.name);
        setShowRemoteRemovePrompt(true);
    };

    const closeAfterRemoval = () => {
        setShowRemoteRemovePrompt(false);
        if (typeof onBack === "function") {
            onBack();
        }
    };

    const removeLocalOnly = async () => {
        const api = window.pywebview?.api;
        if (typeof api?.remove_game !== "function") {
            setRemoveError("Remove is only available in Python launcher mode.");
            return;
        }

        setIsRemoving(true);
        setRemoveError("");
        try {
            const localResult = await api.remove_game(removedGameName);
            if (localResult?.status?.toLowerCase() === "error") {
                setRemoveError(localResult?.message || "Failed to remove game.");
                return;
            }

            setRemoveMessage(localResult?.message || "Game removed from local library.");
            closeAfterRemoval();
        } catch (err) {
            setRemoveError("Failed to remove game from launcher.");
        } finally {
            setIsRemoving(false);
        }
    };

    const removeLocalAndCloud = async () => {
        const api = window.pywebview?.api;
        if (typeof api?.remove_game !== "function") {
            setRemoveError("Remove is only available in Python launcher mode.");
            return;
        }

        if (typeof api?.remove_remote_saves !== "function") {
            setRemoveError("Cloud removal is not available in this launcher version. Choose Delete Local Only.");
            return;
        }

        setIsRemoving(true);
        setRemoveError("");
        try {
            const localResult = await api.remove_game(removedGameName);
            if (localResult?.status?.toLowerCase() === "error") {
                setRemoveError(localResult?.message || "Failed to remove game.");
                return;
            }

            const remoteResult = await api.remove_remote_saves(removedGameName);
            if (remoteResult?.status?.toLowerCase() === "error") {
                setRemoveError(remoteResult?.message || "Game removed locally, but failed to remove cloud saves.");
                return;
            }

            setRemoveMessage(remoteResult?.message || "Game removed locally and cloud saves removed.");
            closeAfterRemoval();
        } catch (err) {
            setRemoveError("Game removed locally, but failed to remove cloud saves.");
        } finally {
            setIsRemoving(false);
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
            await updateGameFromLibrary(true);
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
                {/* Hero Background Image */}
                <div
                    className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-20 scale-105 blur-sm"
                    style={{ backgroundImage: `url("${selectedGame?.thumbnail}")` }}
                ></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#3a1510_0%,#111827_30%,#090D14_70%)] opacity-80"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-background-dark/40 via-background-dark/70 to-background-dark"></div>
            </div>

            <GameDeetsHeader onBack={onBack} />

            <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 pb-24 flex flex-col md:flex-row gap-8 items-start">
                <GameDeetsSummary
                    game={selectedGame}
                    isLaunching={isLaunching}
                    isRemoving={isRemoving}
                    launchError={launchError}
                    launchMessage={launchMessage}
                    removeError={removeError}
                    removeMessage={removeMessage}
                    onLaunch={launchGame}
                    onRemove={removeGame}
                />

                <GameDeetsInfoPanel
                    game={selectedGame}
                    isRefreshing={isRefreshing}
                    onRefreshStatus={refreshStatus}
                    refreshError={refreshError}
                />
            </main>

            <Terminal />

            {showRemoteRemovePrompt && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background-dark/80 backdrop-blur-[2px] px-4">
                    <div className="w-full max-w-[560px] border border-surface-border bg-surface p-6 shadow-[0_0_35px_rgba(0,0,0,0.4)]">
                        <div className="mb-5 border-b border-surface-border pb-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-mono text-xs uppercase tracking-[0.12em] text-primary">Remove Game</p>
                                    <h3 className="font-display text-white text-2xl font-bold leading-tight mt-1">Choose Remove Mode</h3>
                                </div>
                                <button
                                    aria-label="Close"
                                    className="h-9 w-9 border border-surface-border text-muted hover:text-white hover:border-primary transition-colors flex items-center justify-center disabled:opacity-60"
                                    disabled={isRemoving}
                                    onClick={closeAfterRemoval}
                                    type="button"
                                >
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                </button>
                            </div>
                            <p className="mt-2 font-body text-sm text-muted">
                                Select how you want to delete {removedGameName}. This action cannot be undone.
                            </p>
                        </div>

                        {removeError && (
                            <div className="mb-4 border border-warning/40 bg-warning/10 px-3 py-2">
                                <p className="font-body text-sm text-warning">{removeError}</p>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 border-t border-surface-border pt-4">
                            <button
                                className="h-15 px-5 border border-surface-border font-body text-xs uppercase tracking-[0.06em] text-muted hover:text-white hover:border-primary transition-colors"
                                disabled={isRemoving}
                                onClick={closeAfterRemoval}
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                className="h-15 px-5 border border-warning/60 bg-warning/10 text-warning font-display font-bold uppercase tracking-[0.06em] hover:bg-warning/20 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                disabled={isRemoving}
                                onClick={removeLocalOnly}
                                type="button"
                            >
                                {isRemoving ? "Removing..." : "Delete Local Only"}
                            </button>
                            <button
                                className="h-15 px-5 bg-warning text-background-dark font-display font-bold uppercase tracking-[0.06em] hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                disabled={isRemoving}
                                onClick={removeLocalAndCloud}
                                type="button"
                            >
                                {isRemoving ? "Removing..." : "Delete Local + Cloud"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
