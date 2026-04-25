export default function GameDeetsHeader({ onBack }) {
    return (
        <header className="relative z-10 w-full p-6 flex items-center justify-between">
            <button
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors group"
                onClick={onBack}
                type="button"
            >
                <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
                <span className="font-display font-semibold text-sm uppercase tracking-wider">Back to Library</span>
            </button>
        </header>
    );
}