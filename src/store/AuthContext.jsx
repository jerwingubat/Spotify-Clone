import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, googleProvider } from '../firebase.js'
import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth'

const NOT_SIGNED_IN = { user: null, loading: false, signIn: () => {}, signOut: () => {} }

const AuthContext = createContext(NOT_SIGNED_IN)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u)
        setLoading(false)
      }),
    [],
  )

  const signIn = () => signInWithPopup(auth, googleProvider)
  const signOut = () => fbSignOut(auth)

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)