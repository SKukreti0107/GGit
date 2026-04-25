export default function NavBar() {
    return (
        <div className="glass-header sticky top-0 z-50 flex items-center justify-between whitespace-nowrap px-6 py-4     rounded-sm mb-8">
            <div className="flex items-center gap-4 text-white">
                <div className="size-6 text-primary">
                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
                    </svg>
                </div>
                <h2 className="font-display text-white text-xl font-bold leading-tight tracking-[-0.015em]">GGit</h2>
            </div>
            <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-sm h-10 px-6 bg-primary hover:bg-[#d44329] transition-colors text-white text-sm font-bold font-display leading-normal tracking-[0.015em] uppercase shadow-[0_0_15px_rgba(240,79,51,0.3)]">
                <span className="material-symbols-outlined mr-2 text-[18px]">sync</span>
                <span className="truncate">Sync All</span>
            </button>
        </div>
    )
}