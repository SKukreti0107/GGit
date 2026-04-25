import { useEffect, useRef, useState } from "react";

const LEVEL_CLASS = {
    INFO: "text-muted",
    WARN: "text-warning",
    ERROR: "text-primary",
};

export default function Terminal() {
    const [logs, setLogs] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const lastLogIdRef = useRef(0);
    const panelRef = useRef(null);

    useEffect(() => {
        let isMounted = true;
        let timer = null;

        const appendLogs = (incoming) => {
            if (!Array.isArray(incoming) || incoming.length === 0) {
                return;
            }

            setLogs((prev) => {
                const merged = [...prev, ...incoming];
                return merged.slice(-300);
            });

            const last = incoming[incoming.length - 1];
            if (last?.id) {
                lastLogIdRef.current = last.id;
            }
        };

        const fetchLogs = async () => {
            try {
                const api = window.pywebview?.api;
                if (typeof api?.get_logs !== "function") {
                    return;
                }

                const fresh = await api.get_logs(lastLogIdRef.current, 100);
                if (isMounted) {
                    appendLogs(fresh);
                    setError("");
                }
            } catch (err) {
                if (isMounted) {
                    setError("Failed to fetch terminal logs.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        const startPolling = () => {
            fetchLogs();
            timer = setInterval(fetchLogs, 1200);
        };

        const onPywebviewReady = () => {
            startPolling();
        };

        if (typeof window.pywebview?.api?.get_logs === "function") {
            startPolling();
        } else {
            window.addEventListener("pywebviewready", onPywebviewReady, { once: true });
            setTimeout(() => {
                if (isMounted && typeof window.pywebview?.api?.get_logs !== "function") {
                    setLoading(false);
                    setError("pywebview API unavailable in browser mode.");
                }
            }, 1200);
        }

        return () => {
            isMounted = false;
            if (timer) {
                clearInterval(timer);
            }
            window.removeEventListener("pywebviewready", onPywebviewReady);
        };
    }, []);

    useEffect(() => {
        if (!expanded || !panelRef.current) {
            return;
        }

        panelRef.current.scrollTop = panelRef.current.scrollHeight;
    }, [logs, expanded]);

    const clearLogs = async () => {
        try {
            const api = window.pywebview?.api;
            if (typeof api?.clear_logs === "function") {
                await api.clear_logs();
            }
        } catch (err) {
            setError("Failed to clear logs.");
        }

        lastLogIdRef.current = 0;
        setLogs([]);
    };

    const latest = logs.length > 0
        ? logs[logs.length - 1]
        : { timestamp: "--:--:--", source: "bridge", message: loading ? "Loading logs..." : "No logs yet." };

    return (
        <>
            {expanded && (
                <div className="terminal-dock fixed bottom-12 left-0 w-full h-72 z-40 border-t border-surface-border">
                    <div className="flex items-center justify-between px-4 h-10 border-b border-surface-border">
                        <span className="font-mono text-xs text-muted">GGit Terminal</span>
                        <button
                            className="font-mono text-xs text-muted hover:text-white transition-colors"
                            onClick={clearLogs}
                            type="button"
                        >
                            Clear
                        </button>
                    </div>
                    <div className="h-[calc(100%-2.5rem)] overflow-y-auto px-4 py-2" ref={panelRef}>
                        {logs.length === 0 ? (
                            <div className="font-mono text-xs text-muted">{error || "No terminal activity yet."}</div>
                        ) : (
                            logs.map((entry) => (
                                <div className="font-mono text-xs leading-5 whitespace-pre-wrap" key={entry.id}>
                                    <span className="text-muted">[{entry.timestamp}]</span>{" "}
                                    <span className="text-success">[{entry.source}]</span>{" "}
                                    <span className={LEVEL_CLASS[entry.level] || "text-muted"}>{entry.message}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <div className="terminal-dock fixed bottom-0 left-0 w-full h-12 flex items-center px-4 justify-between z-50 hover:bg-[#0a0a0a] transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                    <span className="material-symbols-outlined text-muted text-[16px]">terminal</span>
                    <span className="font-mono text-muted text-xs truncate whitespace-nowrap">
                        <span className="text-muted">[{latest.timestamp}]</span>{" "}
                        <span className="text-success">[{latest.source}]</span>{" "}
                        {error ? error : latest.message}
                    </span>
                </div>
                <button
                    className="text-muted hover:text-white transition-colors"
                    onClick={() => setExpanded((prev) => !prev)}
                    type="button"
                >
                    <span className="material-symbols-outlined text-[20px]">{expanded ? "expand_more" : "expand_less"}</span>
                </button>
            </div>
        </>
    )
}