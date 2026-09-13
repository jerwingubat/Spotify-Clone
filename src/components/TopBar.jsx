import React, { useState } from 'react'
import { useAuth } from '../store/AuthContext.jsx'
import { ArrowIcon } from './Icons.jsx'

export default function TopBar({ onBack, canGoBack, onHome }) {
  const { user, signIn, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="topbar">
      <div className="topbar__arrows">
        <button className="topbar__arrow" onClick={onBack} disabled={!canGoBack}>
          <ArrowIcon dir="left" />
        </button>
        <button className="topbar__arrow" onClick={onHome}>
          <ArrowIcon dir="right" />
        </button>
      </div>

      <div className="topbar__right">
        {!user && (
          <button className="btn-primary" onClick={signIn}>
            Sign in with Google
          </button>
        )}

        {user && (
          <div className="user-menu">
            <button className="user-btn" onClick={() => setMenuOpen((o) => !o)}>
              <span className="user-btn__avatar">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" width="28" height="28" className="user-btn__img" />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#111">
                    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-3.3 0-9 1.65-9 4v1h18v-1c0-2.35-5.7-4-9-4z" />
                  </svg>
                )}
              </span>
              <span>{user.displayName?.split(' ')[0] || 'User'}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="user-btn__chevron">
                <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
              </svg>
            </button>

            {menuOpen && (
              <div className="user-menu__dropdown">
                <button
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