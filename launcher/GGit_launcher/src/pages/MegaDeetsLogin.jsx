import Form from "../components/LoginPage/Form"
import NavBar from "../components/LoginPage/NavBar"
export default function MegaDeetsLogin() {
    return (
        <body
            className="bg-background-dark text-white min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
            <div
                className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none">
            </div>
            <div
                className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none">
            </div>
            <NavBar></NavBar>
            <main className="w-full max-w-md px-6 z-10 relative">
                <div className="glass-card rounded-xl p-8 shadow-2xl flex flex-col relative overflow-hidden">
                    <div
                        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50">
                    </div>
                    <div className="flex justify-center mb-8">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                            <span className="material-symbols-outlined text-4xl text-red-500" data-icon="cloud">cloud</span>
                        </div>
                    </div>
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-display font-bold tracking-tight mb-3">Connect MEGA</h1>
                        <p className="text-text-muted text-sm leading-relaxed">
                            GGit uses Rclone to establish an encrypted tunnel to your MEGA storage.
                        </p>
                    </div>
                    <Form></Form>
                </div>

            </main>
        </body>
    )
} 