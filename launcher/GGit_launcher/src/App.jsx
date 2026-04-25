import { useState, useEffect } from 'react'
import Home from './pages/home'
import GameDeets from './pages/GameDeets'
import MegaDeetsLogin from './pages/MegaDeetsLogin'
import './App.css'

function App() {
  const [selectedGame, setSelectedGame] = useState(null)
  const [isMegaConnected, setIsMegaConnected] = useState(null)

  useEffect(() => {
    const checkMegaStatus = async () => {
      // Allow pywebview to inject api
      await new Promise(resolve => setTimeout(resolve, 100));
      const api = window.pywebview?.api;
      if (api && typeof api.check_mega_status === "function") {
        try {
          const result = await api.check_mega_status();
          setIsMegaConnected(result?.is_connected === true);
        } catch (err) {
          console.error("Failed to check mega status", err);
          setIsMegaConnected(false);
        }
      } else {
        // If not running in pywebview, maybe we are just in dev server
        console.warn("pywebview api not available");
        setIsMegaConnected(true); // default true for dev without bridge
      }
    };
    checkMegaStatus();
  }, []);

  const openGameDetails = (game) => {
    setSelectedGame(game)
  }

  const closeGameDetails = () => {
    setSelectedGame(null)
  }

  if (isMegaConnected === null) {
    return <div className="min-h-screen bg-background-dark text-white flex items-center justify-center">Loading...</div>;
  }

  if (!isMegaConnected) {
    return <MegaDeetsLogin onLoginSuccess={() => setIsMegaConnected(true)} />
  }

  return (
    <>
      {selectedGame ? (
        <GameDeets game={selectedGame} onBack={closeGameDetails} onGameUpdate={setSelectedGame} />
      ) : (
        <Home onOpenGame={openGameDetails}></Home>
      )}
    </>
  )
}

export default App
