import CardGrid from "../components/CardGrid"
import NavBar from "../components/NavBar"
import Terminal from "../components/Terminal"
export default function Home() {
    return (
        <div className="min-h-screen flex flex-col overflow-x-hidden">
            <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#181211] dark group/design-root overflow-x-hidden"
                style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}
            >
                <div className="layout-container flex h-full grow flex-col pb-12">
                    <div className="px-4 md:px-10 flex flex-1 justify-center py-5">
                        <div className="layout-content-container flex flex-col w-full max-w-[1200px] flex-1">
                            <NavBar></NavBar>
                            <CardGrid></CardGrid>
                        </div>
                    </div>
                </div>
            </div>

            <Terminal></Terminal>
        </div>
    )
}