import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'
import { resolvePlayUrl } from '../audio/upstream.js'

const noop = () => {}

const FALLBACK_PLAYER = {
  track: { title: '…', artist: '', album: '' },
  playing: false,
  progress: 0,
  duration: 0,
  volume: 0.82,
  loading: false,
  error: null,
  play: noop,
  playQueue: noop,
  togglePlay: noop,
  seek: noop,
  next: noop,
  prev: noop,
  setVol: noop,
  clearError: noop,
}

const PlayerContext = createContext(FALLBACK_PLAYER)

export function PlayerProvider({ children }) {
  const [track, setTrack] = useState({ title: 'Moonlight', artist: 'Kali Uchis', album: 'GASPEN' })
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.82)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [queue, setQueue] = useState([])
  const [index, setIndex] = useState(-1)

  const audioRef = useRef(null)
  const hlsRef = useRef(null)
  const stateRef = useRef({ playing: false, index: -1, queue: [] })

  stateRef.current.playing = playing
  stateRef.current.index = index
  stateRef.current.queue = queue

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio()
      a.preload = 'auto'
      audioRef.current = a
    }
    return audioRef.current
  }, [])

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      try {
        hlsRef.current.destroy()
      } catch (_) {}
      hlsRef.current = null
    }
  }, [])

  useEffect(() => () => destroyHls(), [destroyHls])

  const playSource = useCallback(
    (a, src) =>
      new Promise((resolve, reject) => {
        const isHls = /\.m3u8($|\?)/i.test(src)
        if (isHls && Hls.isSupported()) {
          destroyHls()
          const hls = new Hls()
          hlsRef.current = hls
          hls.loadSource(src)
          hls.attachMedia(a)
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            a.play().then(resolve).catch(reject)
          })
          hls.on(Hls.Events.ERROR, (_e, data) => {
            if (data.fatal) reject(new Error('Stream error (HLS)'))
          })
        } else {
          a.src = src
          a.play().then(resolve).catch(reject)
        }
      }),
    [destroyHls],
  )

  useEffect(() => {
    const a = audioRef.current
    if (a) a.volume = volume
  }, [volume])

  const loadSong = useCallback(
    async (song) => {
      setLoading(true)
      setError(null)
      const a = audioRef.current || getAudio()
      try {
        const src = await resolvePlayUrl(song)
        if (!src) throw new Error(`No audio found for "${song.title}"`)
        setTrack({ title: song.title, artist: song.artist, album: song.album, source: song.source })
        await playSource(a, src)
      } catch (err) {
        setError(err.message || 'Could not load audio')
      } finally {
        setLoading(false)
      }
    },
    [getAudio, playSource],
  )

  const play = useCallback(
    (song) => {
      setQueue([song])
      setIndex(0)
      loadSong(song)
    },
    [loadSong],
  )

  const playQueue = useCallback(
    (songs, startIndex = 0) => {
      if (!songs.length) return
      setQueue(songs)
      setIndex(startIndex)
      loadSong(songs[startIndex])
    },
    [loadSong],
  )

  const togglePlay = useCallback(() => {
    const a = audioRef.current
    if (!a || !a.src) {
      const song = stateRef.current.queue[stateRef.current.index] || FALLBACK_PLAYER.track
      loadSong(song)
      return
    }
    if (a.paused) {
      a.play().catch((e) => setError(e.message))
    } else {
      a.pause()
    }
  }, [loadSong])

  const seek = useCallback((t) => {
    const a = audioRef.current
    if (a && Number.isFinite(t)) {
      a.currentTime = t
      setProgress(t)
    }
  }, [])

  const next = useCallback(() => {
    const { queue: q, index: i } = stateRef.current
    if (!q.length) return
    const ni = (i + 1) % q.length
    setIndex(ni)
    loadSong(q[ni])
  }, [loadSong])

  const prev = useCallback(() => {
    const { queue: q, index: i } = stateRef.current
    if (!q.length) return
    const ni = (i - 1 + q.length) % q.length
    setIndex(ni)
    loadSong(q[ni])
  }, [loadSong])

  const setVol = useCallback((v) => {
    setVolume(v)
    if (audioRef.current) audioRef.current.volume = v
  }, [])

  useEffect(() => {
    const a = getAudio()

    const onTime = () => setProgress(a.currentTime || 0)
    const onDur = () => setDuration(a.duration || 0)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => {
      setPlaying(false)
      const { queue: q, index: i } = stateRef.current
      if (q.length && i >= 0 && i < q.length - 1) {
        const ni = i + 1
        setIndex(ni)
        loadSong(q[ni])
      } else {
        setProgress(0)
        destroyHls()
        a.removeAttribute('src')
      }
    }
    const onError = () => setError('Playback error — this track may be unavailable')

    a.addEventListener('timeupdate', onTime)
    a.addEventListener('durationchange', onDur)
    a.addEventListener('play', onPlay)
    a.addEventListener('pause', onPause)
    a.addEventListener('ended', onEnded)
    a.addEventListener('error', onError)

    return () => {
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('durationchange', onDur)
      a.removeEventListener('play', onPlay)
      a.removeEventListener('pause', onPause)
      a.removeEventListener('ended', onEnded)
      a.removeEventListener('error', onError)
    }
  }, [getAudio, loadSong, destroyHls])

  return (
    <PlayerContext.Provider
      value={{
        track,
        playing,
        progress,
        duration,
        volume,
        loading,
        error,
        play,
        playQueue,
        togglePlay,
        seek,
        next,
        prev,
        setVol,
        clearError: () => setError(null),
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => useContext(PlayerContext)