export default function Form() {
    return (
        <form class="flex flex-col gap-5">
            <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-300" for="email">Email address</label>
                <input
                    class="w-full bg-input-bg border border-input-border rounded px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 font-sans"
                    id="email" placeholder="account@example.com" required="" type="email" />
            </div>
            <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-300" for="password">Password</label>
                <div class="relative">
                    <input
                        class="w-full bg-input-bg border border-input-border rounded px-4 py-3 pr-12 text-white placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 font-sans"
                        id="password" placeholder="••••••••" required="" type="password" />
                    <button
                        class="absolute inset-y-0 right-0 px-4 flex items-center text-text-muted hover:text-white transition-colors"
                        type="button">
                        <span class="material-symbols-outlined text-xl" data-icon="visibility">visibility</span>
                    </button>
                </div>
            </div>
            <button
                class="mt-4 w-full bg-primary hover:bg-red-600 text-white font-semibold py-3.5 px-4 rounded transition-all duration-200 glow-button font-display tracking-wide"
                type="submit">
                Authorize Connection
            </button>
        </form>

    )
}