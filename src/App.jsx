import React, { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import HomePage from './components/HomePage.jsx'
import SearchPage from './components/SearchPage.jsx'
import PlaylistPage from './components/PlaylistPage.jsx'
import Player from './components/Player.jsx'
import { playlists } from './data.js'
import { AuthProvider, useAuth } from './store/AuthContext.jsx'
import { PlaylistsProvider, usePlaylists } from './store/PlaylistsContext.jsx'
import { PlayerProvider } from './store/PlayerContext.jsx'

function AppInner() {
  const { user } = useAuth()
  const { playlists: userPlaylists } = usePlaylists()
  const [view, setView] = useState('home')
  const [selected, setSelected] = useState(null)
  const [stack, setStack] = useState([])

  const library = user ? userPlaylists : playlists

  const openPlaylist = (p) => {
    setStack((s) => [...s, view])
    setSelected(p)
    setView('playlist')
  }

  const goBack = () => {
    setView(stack[stack.length - 1] ?? 'home')
    setStack((s) => s.slice(0, -1))
  }

  return (
    <div className="app">
      <Sidebar
        view={view}
        setView={setView}
        library={library}
        isUserLibrary={!!user}
        setSelectedPlaylist={openPlaylist}
      />

      <main className="main">
        <TopBar
          onBack={goBack}
          canGoBack={stack.length > 0}
          onHome={() => setView('home')}
        />

        <div className="main__content">
          {view === 'home' && <HomePage onOpenPlaylist={openPlaylist} />}
          {view === 'search' && <SearchPage onOpenPlaylist={openPlaylist} />}
          {view === 'playlist' && (
            <PlaylistPage playlist={selected} onBack={goBack} />
          )}
          {view === 'library' && <HomePage onOpenPlaylist={openPlaylist} />}
        </div>
      </main>

      <Player />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <PlaylistsProvider>
        <PlayerProvider>
          <AppInner />
        </PlayerProvider>
      </PlaylistsProvider>
    </AuthProvider>
  )
}