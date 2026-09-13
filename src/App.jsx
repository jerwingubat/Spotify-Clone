import React, { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import MobileMenu from './components/MobileMenu.jsx'
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
  const [menuOpen, setMenuOpen] = useState(false)

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

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        view={view}
        setView={setView}
        library={library}
        isUserLibrary={!!user}
        setSelectedPlaylist={openPlaylist}
      />

      <main className="flex min-h-0 min-w-0 flex-col">
        <TopBar
          onBack={goBack}
          canGoBack={stack.length > 0}
          onHome={() => setView('home')}
          onOpenMenu={() => setMenuOpen(true)}
        />

        <div className="main__content flex-1 overflow-y-auto rounded-lg bg-[linear-gradient(180deg,#1f1f1f_0%,#121212_300px)] md:min-h-0">
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