export const STATUS_META = {
    "Checking...": { icon: "sync", iconClass: "text-primary animate-spin", textClass: "text-primary", toneClass: "border-primary/30 bg-primary/10" },
    Synced: { icon: "check_circle", iconClass: "text-success", textClass: "text-success", toneClass: "border-emerald-500/30 bg-emerald-500/10" },
    "Local Newer": { icon: "north", iconClass: "text-warning", textClass: "text-warning", toneClass: "border-amber-500/30 bg-amber-500/10" },
    "Remote Newer": { icon: "south", iconClass: "text-primary", textClass: "text-primary", toneClass: "border-primary/30 bg-primary/10" },
    "Out of Sync": { icon: "sync_problem", iconClass: "text-warning", textClass: "text-warning", toneClass: "border-amber-500/30 bg-amber-500/10" },
    "Local Only": { icon: "computer", iconClass: "text-warning", textClass: "text-warning", toneClass: "border-amber-500/30 bg-amber-500/10" },
    "Remote Only": { icon: "cloud", iconClass: "text-primary", textClass: "text-primary", toneClass: "border-primary/30 bg-primary/10" },
    "No Saves": { icon: "inventory_2", iconClass: "text-muted", textClass: "text-muted", toneClass: "border-slate-700 bg-slate-800/40" },
    "Not Configured": { icon: "settings", iconClass: "text-warning", textClass: "text-warning", toneClass: "border-amber-500/30 bg-amber-500/10" },
    "Rclone Missing": { icon: "build", iconClass: "text-warning", textClass: "text-warning", toneClass: "border-amber-500/30 bg-amber-500/10" },
    "Remote Missing": { icon: "cloud_off", iconClass: "text-warning", textClass: "text-warning", toneClass: "border-amber-500/30 bg-amber-500/10" },
    "Status Error": { icon: "error", iconClass: "text-warning", textClass: "text-warning", toneClass: "border-amber-500/30 bg-amber-500/10" },
};

export function getStatusMeta(status) {
    const normalizedStatus = status || "Unknown";
    const fallback = {
        icon: "help",
        iconClass: "text-muted",
        textClass: "text-muted",
        toneClass: "border-slate-700 bg-slate-800/40",
    };

    return {
        normalizedStatus,
        meta: STATUS_META[normalizedStatus] || fallback,
    };
}