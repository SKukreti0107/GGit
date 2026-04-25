import { useEffect, useState } from "react";
import GameCard from "./GameCard"
export default function CardGrid({ refreshKey = 0, onOpenGame }) {

    const [games, setGames] = useState([]);
    const [isCheckingStatuses, setIsCheckingStatuses] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;
        setError("");
        const forceRefresh = refreshKey > 0;

        const markChecking = (library) => {
            if (!Array.isArray(library)) {
                return [];
            }

            return library.map((entry) => ({
                ...entry,
                status: "Checking...",
            }));
        };

        const getLibrary = async () => {
            try {
                const api = window.pywebview?.api;
                if (typeof api?.get_library !== "function") {
                    if (isMounted) {
                        setError("pywebview API not ready. Launch this page via Python app.");
                    }
                    return;
                }

                setIsCheckingStatuses(true);

                const baseLibrary = await api.get_library();
                if (isMounted) {
                    setGames(markChecking(baseLibrary));
                }

                if (typeof api.get_library_with_status !== "function") {
                    return;
                }

                const res = await api.get_library_with_status(forceRefresh);
                if (isMounted) {
                    setGames(Array.isArray(res) ? res : []);
                }
            } catch (err) {
                console.error("Failed to load library", err);
                if (isMounted) {
                    setError("Failed to load game library from Python bridge.");
                }
            }
            finally {
                if (isMounted) setIsCheckingStatuses(false);
            }
        }

        const onPywebviewReady = () => {
            getLibrary();
        };

        if (typeof window.pywebview?.api?.get_library === "function") {
            getLibrary();
        } else {
            window.addEventListener("pywebviewready", onPywebviewReady, { once: true });

            // In plain browser dev mode, pywebview will never be injected.
            setTimeout(() => {
                if (isMounted && typeof window.pywebview?.api?.get_library !== "function") {
                    setError("pywebview API unavailable in browser mode.");
                }
            }, 1200);
        }

        return () => {
            isMounted = false;
            window.removeEventListener("pywebviewready", onPywebviewReady);
        };
    }, [refreshKey]);

    if (error) {
        return <div className="px-2 text-warning">{error}</div>;
    }

    if (!games.length) {
        return <div className="px-2 text-muted">No games in library yet.</div>;
    }



    return (
        <div className="space-y-3">
            {isCheckingStatuses && (
                <div className="px-2 font-mono text-xs text-muted">Checking game status...</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
            {games.map((g)=>(
                <GameCard game={g} key={g.name} onOpen={onOpenGame}></GameCard>
            ))}
            </div>
        </div>
    )
}