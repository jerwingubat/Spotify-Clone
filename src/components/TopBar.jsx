import React, { useEffect, useState } from 'react'
import { useAuth } from '../store/AuthContext.jsx'
import { ArrowIcon, MenuIcon } from './Icons.jsx'

export default function TopBar({ onBack, canGoBack, onHome, onOpenMenu }) {
  const { user, signIn, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [installEvt, setInstallEvt] = useState(null)

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault()
      setInstallEvt(e)
    }
    const onInstalled = () => setInstallEvt(null)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const promptInstall = async () => {
    if (!installEvt) return
    installEvt.prompt()
    try {
      const { outcome } = await installEvt.userChoice
      if (outcome === 'accepted') setInstallEvt(null)
    } catch {
      /* dismissed */
    }
    setMenuOpen(false)
  }

  return (
    <header className="flex shrink-0 items-center justify-between px-3 py-3 md:px-6">
      <div className="flex items-center gap-2">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white md:hidden"
          onClick={onOpenMenu}
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          <MenuIcon />
        </button>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white transition disabled:text-[#7a7a7a]"
          onClick={onBack}
          disabled={!canGoBack}
        >
          <ArrowIcon dir="left" />
        </button>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white transition"
          onClick={onHome}
        >
          <ArrowIcon dir="right" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {installEvt && !user && (
          <button
            className="rounded-full border border-white/50 px-4 py-2.5 text-[13px] font-bold text-white transition hover:scale-[1.03] hover:border-white"
            onClick={promptInstall}
          >
            Install app
          </button>
        )}

        {!user && (
          <button
            className="rounded-full bg-white px-5 py-2.5 text-[15px] font-bold text-black transition hover:scale-[1.04]"
            onClick={signIn}
          >
            Sign in with Google
          </button>
        )}

        {user && (
          <div className="user-menu relative">
            <button
              className="flex items-center gap-1 rounded-full bg-black/60 py-1 pl-1 pr-2.5 text-sm font-bold transition hover:bg-[#282828]"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-spotify">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" width="28" height="28" className="block rounded-full" />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#111">
                    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-3.3 0-9 1.65-9 4v1h18v-1c0-2.35-5.7-4-9-4z" />
                  </svg>
                )}
              </span>
              <span className="hidden sm:block">{user.displayName?.split(' ')[0] || 'User'}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={`text-[#b3b3b3] transition-transform ${menuOpen ? 'rotate-180' : ''}`}
              >
                <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-20 min-w-[180px] overflow-hidden rounded-md bg-[#282828] p-1 shadow-[0_16px_32px_rgba(0,0,0,0.6)]">
                {installEvt && (
                  <button
                    className="block w-full rounded px-3 py-3 text-left text-sm text-[#b3b3b3] transition hover:bg-white/10 hover:text-white"
                    onClick={promptInstall}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: '-3px', marginRight: 8 }}>
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                    </svg>
                    Install app
                  </button>
                )}
                <button
                  className="block w-full rounded px-3 py-3 text-left text-sm text-[#b3b3b3] transition hover:bg-white/10 hover:text-white"
                  onClick={() => {
                    setMenuOpen(false)
                    signOut()
                  }}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}