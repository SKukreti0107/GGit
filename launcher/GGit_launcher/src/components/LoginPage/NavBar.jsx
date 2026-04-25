export default function NavBar() {
    return (
        <div class="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 text-primary">
                    <svg fill="none" viewbox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
                    </svg>
                </div>
                <h2 class="text-xl font-display font-bold tracking-tight">GGit</h2>
            </div>
        </div>
    )
}