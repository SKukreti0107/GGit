import { getStatusMeta } from "../statusMeta";

export default function GameDeetsSummary({
    game,
    isLaunching,
    isRemoving,
    launchMessage,
    launchError,
    removeMessage,
    removeError,
    onLaunch,
    onRemove,
}) {
    const { normalizedStatus, meta } = getStatusMeta(game?.status);

    return (
        <aside className="w-full md:w-[32%] flex flex-col gap-6 shrink-0">
            <div className="rounded-lg p-6 flex flex-col gap-6 shadow-2xl bg-[rgba(20,26,37,0.73)] backdrop-blur-[25px] border border-slate-800">
                <div className="w-full aspect-[3/4] rounded bg-gradient-to-br from-[#1f2937] via-[#111827] to-[#0b0f17] border border-slate-800 flex items-end p-5 bg-center bg-no-repeat bg-cover relative overflow-hidden"
                    style={{ 
                        backgroundImage: `url("${game?.thumbnail || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=500&auto=format&fit=crop"}")` 
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent"></div>
                    <span className="relative z-10 font-display text-4xl font-bold text-white/90 leading-none truncate">
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

                <button
                    className="w-full h-[48px] border border-warning/40 bg-warning/10 hover:bg-warning/20 text-warning font-display font-bold uppercase tracking-[0.05em] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isRemoving}
                    onClick={onRemove}
                    type="button"
                >
                    <span className="material-symbols-outlined">delete</span>
                    {isRemoving ? "Removing..." : "Remove Game"}
                </button>

                {launchMessage && <p className="font-body text-sm text-success">{launchMessage}</p>}
                {launchError && <p className="font-body text-sm text-warning">{launchError}</p>}
                {removeMessage && <p className="font-body text-sm text-success">{removeMessage}</p>}
                {removeError && <p className="font-body text-sm text-warning">{removeError}</p>}
            </div>
        </aside>
    );
}