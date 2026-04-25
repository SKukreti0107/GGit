import { useEffect, useState } from "react";
import GameCard from "./GameCard"
export default function CardGrid({ refreshKey = 0, onOpenGame }) {

    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError("");

        const getLibrary = async () => {
            try {
                const api = window.pywebview?.api;
                if (typeof api?.get_library !== "function") {
                    if (isMounted) {
                        setError("pywebview API not ready. Launch this page via Python app.");
                    }
                    return;
                }

                const fetchLibrary = typeof api.get_library_with_status === "function"
                    ? api.get_library_with_status.bind(api)
                    : api.get_library.bind(api);

                const res = await fetchLibrary();
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
                if (isMounted) setLoading(false);
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
                    setLoading(false);
                    setError("pywebview API unavailable in browser mode.");
                }
            }, 1200);
        }

        return () => {
            isMounted = false;
            window.removeEventListener("pywebviewready", onPywebviewReady);
        };
    }, [refreshKey]);




    if (loading) {
        return <div className="px-2">Loading library...</div>;
    }

    if (error) {
        return <div className="px-2 text-warning">{error}</div>;
    }



    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
            {games.map((g)=>(
                <GameCard game={g} key={g.name} onOpen={onOpenGame}></GameCard>
            ))}
            
        </div>
    )
}