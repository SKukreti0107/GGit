import { getStatusMeta } from "../statusMeta";

function ValueRow({ label, value }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-2 md:gap-4 py-2 border-b border-slate-800 last:border-b-0">
            <span className="font-body text-xs uppercase tracking-[0.08em] text-muted">{label}</span>
            <span className="font-mono text-xs text-slate-300 break-all">{value || "-"}</span>
        </div>
    );
}

export default function GameDeetsInfoPanel({ game, isRefreshing, refreshError, onRefreshStatus }) {
    const { normalizedStatus, meta } = getStatusMeta(game?.status);

    return (
        <section className="w-full md:w-[68%] flex flex-col gap-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">tune</span>
                    Game Configuration
                </h2>
                <button
                    className="px-4 py-2 text-sm font-display font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 rounded transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isRefreshing}
                    onClick={onRefreshStatus}
                    type="button"
                >
                    <span className="material-symbols-outlined text-sm">sync</span>
                    {isRefreshing ? "Refreshing..." : "Refresh Status"}
                </button>
            </div>

            <div className="rounded p-5 border border-slate-800 bg-[rgba(20,26,37,0.73)] backdrop-blur-[25px]">
                <ValueRow label="Game Name" value={game?.name} />
                <ValueRow label="Executable" value={game?.exe} />
                <ValueRow label="Save Folder" value={game?.save} />
            </div>

            <div className={`rounded p-5 border ${meta.toneClass} backdrop-blur-[25px]`}>
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 border border-current/30 bg-black/20 flex items-center justify-center shrink-0">
                        <span className={`material-symbols-outlined ${meta.iconClass}`}>{meta.icon}</span>
                    </div>
                    <div>
                        <h3 className={`font-display font-bold mb-1 ${meta.textClass}`}>Current Status: {normalizedStatus}</h3>
                        <p className="text-sm text-slate-300">
                            Status comes from the same backend check used in your library cards.
                        </p>
                    </div>
                </div>
            </div>

            {refreshError && (
                <p className="font-body text-sm text-warning">{refreshError}</p>
            )}
        </section>
    );
}