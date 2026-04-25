import { getStatusMeta } from "./statusMeta";

export default function GameCard({ game, onOpen }) {
    const { normalizedStatus, meta } = getStatusMeta(game?.status);
    const handleOpen = () => {
        if (typeof onOpen === "function") {
            onOpen(game);
        }
    };

    return (
        <button
            className="game-card flex flex-col rounded-sm overflow-hidden cursor-pointer relative group text-left"
            onClick={handleOpen}
            type="button"
        >
            <div className="w-full h-40 bg-center bg-no-repeat bg-cover border-b border-surface-border relative bg-surface-light"
                style={{ 
                    backgroundImage: `url("${game?.thumbnail || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=500&auto=format&fit=crop"}")` 
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent"></div>
            </div>
            <div className="p-4 flex flex-col gap-3">
                <h3 className="font-display text-white text-lg font-bold leading-tight truncate">{game?.name || "Unnamed Game"}</h3>
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[14px] ${meta.iconClass}`}>{meta.icon}</span>
                        <span className={`font-mono text-xs ${meta.textClass}`}>{normalizedStatus}</span>
                    </div>
                </div>
            </div>
        </button>
    )
}