import { useState } from 'react'

export default function Form({ onLoginSuccess }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const api = window.pywebview?.api
            if (!api || typeof api.setup_mega !== "function") {
                // Mock success if not running in pywebview for dev
                console.warn("pywebview api not available, mocking success")
                setTimeout(() => {
                    setIsLoading(false)
                    if (onLoginSuccess) onLoginSuccess()
                }, 1000)
                return
            }

            const result = await api.setup_mega(email, password)
            if (result?.status === 'success') {
                if (onLoginSuccess) onLoginSuccess()
            } else {
                setError(result?.message || 'Failed to connect to MEGA.')
            }
        } catch (err) {
            console.error(err)
            setError('An error occurred during connection.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded">
                    {error}
                </div>
            )}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300" htmlFor="email">Email address</label>
                <input
                    className="w-full bg-input-bg border border-input-border rounded px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 font-sans"
                    id="email" placeholder="account@example.com" required type="email"
                    value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300" htmlFor="password">Password</label>
                <div className="relative">
                    <input
                        className="w-full bg-input-bg border border-input-border rounded px-4 py-3 pr-12 text-white placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 font-sans"
                        id="password" placeholder="••••••••" required type={showPassword ? "text" : "password"}
                        value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button
                        className="absolute inset-y-0 right-0 px-4 flex items-center text-text-muted hover:text-white transition-colors"
                        type="button" onClick={() => setShowPassword(!showPassword)}>
                        <span className="material-symbols-outlined text-xl" data-icon="visibility">
                            {showPassword ? "visibility_off" : "visibility"}
                        </span>
                    </button>
                </div>
            </div>
            <button
                className={`mt-4 w-full bg-primary hover:bg-red-600 text-white font-semibold py-3.5 px-4 rounded transition-all duration-200 glow-button font-display tracking-wide ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                type="submit" disabled={isLoading}>
                {isLoading ? 'Connecting...' : 'Authorize Connection'}
            </button>
        </form>
    )
}