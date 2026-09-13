import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'
import { resolvePlayUrl, resolveByName, probeStream } from '../audio/upstream.js'

const noop = () => {}

const FALLBACK_PLAYER = {
  track: { title: '…', artist: '', album: '' },
  playing: false,
  progress: 0,
  duration: 0,
  volume: 0.82,
  loading: false,
  error: null,
  fsOpen: false,
  toggleFs: noop,
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
  const [fsOpen, setFsOpen] = useState(false)
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
    (a, src, hls) =>
      new Promise((resolve, reject) => {
        if (hls && Hls.isSupported()) {
          destroyHls()
          const hlsPlayer = new Hls()
          hlsRef.current = hlsPlayer
          hlsPlayer.loadSource(src)
          hlsPlayer.attachMedia(a)
          hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
            a.play().then(resolve).catch(reject)
          })
          hlsPlayer.on(Hls.Events.ERROR, (_e, data) => {
            if (data.fatal) {
              let msg = 'Stream error (HLS)'
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                const http = data.networkDetails && data.networkDetails.status
                const detail = String(data.details || '').replace(/_/g, ' ')
                msg = `Stream error (HLS) — ${detail.toLowerCase()}${http ? ` (HTTP ${http})` : ''}`
                if (data.networkDetails && typeof data.networkDetails.clone === 'function') {
                  data.networkDetails
                    .clone()
                    .text()
                    .then((t) => {
                      try {
                        const b = JSON.parse(t)
                        if (b && b.detail) setError(`Stream error (HLS) — ${String(b.detail).slice(0, 180)}`)
                      } catch (_) {}
                    })
                    .catch(() => {})
                }
              }
              hlsPlayer.destroy()
              hlsRef.current = null
              reject(new Error(msg))
            }
          })
          return
        }
        a.src = src
        a.play().then(resolve, reject)
      }),
    [destroyHls],
  )

  useEffect(() => {
    const a = audioRef.current
    if (a) a.volume = volume
  }, [volume])

  const loadSongRef = useRef(null)

  const skipOrStop = useCallback((msg) => {
    const { queue: q, index: i } = stateRef.current
    const ni = i + 1
    if (q.length > 1 && ni < q.length) {
      setIndex(ni)
      if (loadSongRef.current) loadSongRef.current(q[ni])
    } else {
      setError(msg || 'Playback error — this track may be unavailable')
      setPlaying(false)
    }
  }, [])

  const loadSong = useCallback(
    async (song) => {
      setLoading(true)
      setError(null)
      const a = audioRef.current || getAudio()
      destroyHls()
      try {
        let { url } = await resolvePlayUrl(song)
        if (!url) throw new Error(`No audio found for "${song.title}"`)
        let type
        try {
          type = await probeStream(url)
        } catch (probeErr) {
          if (!song.url) throw probeErr
          const alt = await resolveByName(`${song.title} ${song.artist}`.trim(), url)
          if (alt && alt.url && alt.url !== url) {
            url = alt.url
            type = await probeStream(url)
          } else {
            throw probeErr
          }
        }
        const hls = type === 'hls'
        setTrack({ title: song.title, artist: song.artist, album: song.album, source: song.source, img: song.thumbnail || song.img })
        await playSource(a, url, hls)
      } catch (err) {
        skipOrStop(err.message || 'Could not load audio')
      } finally {
        setLoading(false)
      }
    },
    [getAudio, playSource, destroyHls, skipOrStop],
  )

  useEffect(() => {
    loadSongRef.current = loadSong
  }, [loadSong])

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

  const toggleFs = useCallback(() => setFsOpen((v) => !v), [])

  // Media Session API — lock-screen / notification controls + background playback
  useEffect(() => {
    if (!('mediaSession' in navigator)) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title || 'Spotibai',
      artist: track.artist || '',
      album: track.album || '',
      artwork: track.img
        ? [
            { src: track.img, sizes: '512x512' },
            { src: track.img, sizes: '256x256' },
          ]
        : [],
    })

    const handle = (action, fn) => {
      try {
        navigator.mediaSession.setActionHandler(action, fn)
      } catch (_) {}
    }
    handle('play', () => {
      const a = audioRef.current
      if (a) a.play().catch(() => setError('Playback error — this track may be unavailable'))
    })
    handle('pause', () => audioRef.current && audioRef.current.pause())
    handle('previoustrack', () => prev())
    handle('nexttrack', () => next())
    handle('seekto', (d) => {
      const a = audioRef.current
      if (a && Number.isFinite(d.seekTime)) a.currentTime = d.seekTime
    })

    navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'
    if (duration > 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration,
          playbackRate: 1,
          position: Math.min(progress, duration),
        })
      } catch (_) {}
    }
  }, [track, playing, duration, progress, prev, next])

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
    const onError = () => skipOrStop('Playback error — this track may be unavailable')

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
  }, [getAudio, loadSong, destroyHls, skipOrStop])

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
        fsOpen,
        toggleFs,
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