const STATUS_STYLES = {
    Synced: { icon: "check_circle", iconClass: "text-success", textClass: "text-success" },
    "Local Newer": { icon: "north", iconClass: "text-warning", textClass: "text-warning" },
    "Remote Newer": { icon: "south", iconClass: "text-primary", textClass: "text-primary" },
    "Out of Sync": { icon: "sync_problem", iconClass: "text-warning", textClass: "text-warning" },
    "Local Only": { icon: "computer", iconClass: "text-warning", textClass: "text-warning" },
    "Remote Only": { icon: "cloud", iconClass: "text-primary", textClass: "text-primary" },
    "No Saves": { icon: "inventory_2", iconClass: "text-muted", textClass: "text-muted" },
    "Not Configured": { icon: "settings", iconClass: "text-warning", textClass: "text-warning" },
    "Rclone Missing": { icon: "build", iconClass: "text-warning", textClass: "text-warning" },
    "Remote Missing": { icon: "cloud_off", iconClass: "text-warning", textClass: "text-warning" },
    "Status Error": { icon: "error", iconClass: "text-warning", textClass: "text-warning" },
};

export default function GameCard({name,status}) {
    const normalizedStatus = status || "Unknown";
    const statusStyle = STATUS_STYLES[normalizedStatus] || {
        icon: "help",
        iconClass: "text-muted",
        textClass: "text-muted",
    };

    return (
        <div className="game-card flex flex-col rounded-sm overflow-hidden cursor-pointer relative group">
            <div className="w-full h-40 bg-center bg-no-repeat bg-cover border-b border-surface-border relative"
                data-alt="neon lit futuristic cyberpunk city street scene with wet pavement at night"
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBplIVzU7CWPvhCveIxnpD6oiMjkEVwezjipveWiU9gSNvjcZs_yYyfj-DBXYes-XORT5aUykozCgONVJ0qbOARYqO93vuvViIhmOBM8gcAHB4L-qEle6WglDWFqa7GxLskNL01d4IjTz7JynGQDYPsRj8vJIFUlVNBGAr4nMUkoWbCqhUA59wySkA89QvCjGVmEedZFri5vLUcZ4WvAKL36kM49CamKEJPGZCxgO6if2gnLfhNCiXUmyzzyAYrz4v1QmC7iRLoZz8")' }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent"></div>
            </div>
            <div className="p-4 flex flex-col gap-3">
                <h3 className="font-display text-white text-lg font-bold leading-tight truncate">{name}</h3>
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[14px] ${statusStyle.iconClass}`}>{statusStyle.icon}</span>
                        <span className={`font-mono text-xs ${statusStyle.textClass}`}>{normalizedStatus}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}