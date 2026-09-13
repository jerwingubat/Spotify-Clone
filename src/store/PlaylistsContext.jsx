import React, { createContext, useContext, useCallback, useEffect, useState } from 'react'
import { db } from '../firebase.js'
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore'
import { useAuth } from './AuthContext.jsx'

const noop = () => {}

const clean = (v) => {
  if (Array.isArray(v)) return v.map(clean)
  if (v && typeof v === 'object') {
    const o = {}
    for (const k of Object.keys(v)) {
      const val = clean(v[k])
      if (val !== undefined) o[k] = val
    }
    return o
  }
  return v
}

const FALLBACK_PLAYLISTS = {
  playlists: [],
  loading: false,
  create: noop,
  updatePlaylist: noop,
  remove: noop,
  addSong: noop,
  removeSong: noop,
  likeSong: noop,
  unlikeSong: noop,
  isLiked: () => false,
  reload: noop,
}

const PlaylistsContext = createContext(FALLBACK_PLAYLISTS)

export function PlaylistsProvider({ children }) {
  const { user } = useAuth()
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(false)

  const col = useCallback(
    () => collection(db, `users/${user.uid}/playlists`),
    [user],
  )

  const reload = useCallback(async () => {
    if (!user) {
      setPlaylists([])
      return
    }
    setLoading(true)
    const q = query(col(), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    setPlaylists(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }, [user, col])

  useEffect(() => {
    reload()
  }, [reload])

  const create = async ({ name, color, desc = '', songs = [] }) => {
    if (!user) throw new Error('Sign in to create playlists')
    const ref = await addDoc(col(), {
      name,
      color,
      desc,
      songs: songs.map(clean),
      createdAt: serverTimestamp(),
      owner: user.uid,
    })
    await reload()
    return { id: ref.id, name, color, desc, songs }
  }

  const updatePlaylist = async (id, patch) => {
    await updateDoc(doc(col(), id), patch)
    await reload()
  }

  const remove = async (id) => {
    await deleteDoc(doc(col(), id))
    await reload()
  }

  const addSong = async (id, song) => {
    await updateDoc(doc(col(), id), { songs: arrayUnion(clean(song)) })
    await reload()
  }

  const removeSong = (id, title) =>
    updatePlaylist(id, {
      songs: playlists.find((p) => p.id === id)?.songs.filter((s) => s.title !== title) || [],
    })

  const findLiked = () => playlists.find((p) => p.name === 'Liked Songs')

  const likeSong = async (song) => {
    let liked = findLiked()
    if (!liked) liked = await create({ name: 'Liked Songs', color: '#503750', desc: 'Songs you liked', songs: [] })
    await addSong(liked.id, song)
    return liked
  }

  const unlikeSong = async (song) => {
    const liked = findLiked()
    if (liked) await removeSong(liked.id, song.title)
  }

  const isLiked = (song) =>
    !!playlists.find((p) => p.name === 'Liked Songs' && p.songs?.some((s) => s.title === song.title))

  return (
    <PlaylistsContext.Provider
      value={{
        playlists,
        loading,
        create,
        updatePlaylist,
        remove,
        addSong,
        removeSong,
        likeSong,
        unlikeSong,
        isLiked,
        reload,
      }}
    >
      {children}
    </PlaylistsContext.Provider>
  )
}

export const usePlaylists = () => useContext(PlaylistsContext)