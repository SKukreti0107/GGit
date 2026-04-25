import { getStatusMeta } from "../statusMeta";

export default function GameDeetsSummary({ game, isLaunching, launchMessage, launchError, onLaunch }) {
    const { normalizedStatus, meta } = getStatusMeta(game?.status);

    return (
        <aside className="w-full md:w-[32%] flex flex-col gap-6 shrink-0">
            <div className="rounded-lg p-6 flex flex-col gap-6 shadow-2xl bg-[rgba(20,26,37,0.73)] backdrop-blur-[25px] border border-slate-800">
                <div className="w-full aspect-[3/4] rounded bg-gradient-to-br from-[#1f2937] via-[#111827] to-[#0b0f17] border border-slate-800 flex items-end p-5">
                    <span className="font-display text-4xl font-bold text-white/90 leading-none truncate">
                        {game?.name || "Game"}
                    </span>
                </div>

                <div className="flex flex-col gap-3">
                    <h1 className="text-3xl font-display font-bold text-white tracking-tight">{game?.name || "Unknown Game"}</h1>
                    <div className={`inline-flex items-center gap-2 text-sm mt-1 px-2.5 py-1.5 border rounded ${meta.toneClass}`}>
                        <span className={`material-symbols-outlined text-[14px] ${meta.iconClass}`}>{meta.icon}</span>
                        <span className={`font-mono ${meta.textClass}`}>{normalizedStatus}</span>
                    </div>
                </div>

                <button
                    className="w-full h-[52px] bg-primary hover:bg-[#d9442a] text-white rounded font-display font-bold uppercase tracking-[0.05em] transition-all shadow-glow-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isLaunching}
                    onClick={onLaunch}
                    type="button"
                >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    {isLaunching ? "Launching..." : "Launch Game"}
                </button>

                {launchMessage && <p className="font-body text-sm text-success">{launchMessage}</p>}
                {launchError && <p className="font-body text-sm text-warning">{launchError}</p>}
            </div>
        </aside>
    );
}