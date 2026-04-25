import NavBar from "../components/NavBar"

export default function Account({ onBack, onLogout }) {
    const handleLogout = async () => {
        try {
            const api = window.pywebview?.api;
            if (api && typeof api.logout_mega === "function") {
                const result = await api.logout_mega();
                if (result?.status === 'success') {
                    if (onLogout) onLogout();
                } else {
                    alert(result?.message || "Failed to logout.");
                }
            } else {
                console.warn("pywebview api not available, mocking logout");
                if (onLogout) onLogout();
            }
        } catch (err) {
            console.error("Failed to logout mega", err);
            alert("An error occurred during logout.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background-dark text-white">
            <div className="px-4 md:px-10 py-5 max-w-[1200px] w-full mx-auto">
                <div className="glass-header flex items-center px-6 py-4 rounded-sm mb-8 relative">
                    <button 
                        onClick={onBack}
                        className="flex items-center text-text-muted hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined mr-2">arrow_back</span>
                        Back
                    </button>
                    <h2 className="absolute left-1/2 -translate-x-1/2 font-display text-white text-xl font-bold">Account Management</h2>
                </div>

                <div className="glass-card rounded-xl p-8 max-w-2xl mx-auto border border-surface-border bg-surface shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-4">
                            <span className="material-symbols-outlined text-5xl text-primary" data-icon="account_circle">account_circle</span>
                        </div>
                        <h3 className="text-2xl font-display font-bold">MEGA Account</h3>
                        <p className="text-text-muted mt-2 text-center">
                            Your GGit is currently linked to a MEGA remote for saving and syncing your games.
                        </p>
                    </div>

                    <div className="border-t border-surface-border pt-8 mt-4 flex flex-col items-center">
                        <p className="text-sm text-text-muted mb-4 text-center">
                            If you wish to link a different account or remove access from this device, you can unlink your MEGA account below.
                        </p>
                        <button 
                            onClick={handleLogout}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 hover:border-red-500 px-6 py-3 rounded transition-colors flex items-center font-bold tracking-wide"
                        >
                            <span className="material-symbols-outlined mr-2">logout</span>
                            Unlink MEGA Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
