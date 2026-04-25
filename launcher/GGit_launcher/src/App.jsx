import { useState } from 'react'
import Home from './pages/home'
import GameDeets from './pages/GameDeets'
import './App.css'

function App() {
  const [selectedGame, setSelectedGame] = useState(null)

  const openGameDetails = (game) => {
    setSelectedGame(game)
  }

  const closeGameDetails = () => {
    setSelectedGame(null)
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
