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
            <div className="w-full h-40 bg-center bg-no-repeat bg-cover border-b border-surface-border relative"
                data-alt="neon lit futuristic cyberpunk city street scene with wet pavement at night"
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBplIVzU7CWPvhCveIxnpD6oiMjkEVwezjipveWiU9gSNvjcZs_yYyfj-DBXYes-XORT5aUykozCgONVJ0qbOARYqO93vuvViIhmOBM8gcAHB4L-qEle6WglDWFqa7GxLskNL01d4IjTz7JynGQDYPsRj8vJIFUlVNBGAr4nMUkoWbCqhUA59wySkA89QvCjGVmEedZFri5vLUcZ4WvAKL36kM49CamKEJPGZCxgO6if2gnLfhNCiXUmyzzyAYrz4v1QmC7iRLoZz8")' }}
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