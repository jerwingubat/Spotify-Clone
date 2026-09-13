import React from 'react'
import NowPlayingCard from './NowPlayingCard.jsx'
import { usePlayer } from '../store/PlayerContext.jsx'

export default function FullscreenNowPlaying() {
  const { track, fsOpen, toggleFs } = usePlayer()
  const ref = React.useRef(null)

  React.useEffect(() => {
    const el = ref.current
    try {
      if (fsOpen) {
        const enter = el && (el.requestFullscreen || el.webkitRequestFullscreen)
        if (enter) enter.call(el)
      } else if (document.fullscreenElement || document.webkitFullscreenElement) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen
        if (exit) exit.call(document)
      }
    } catch (_) {}
  }, [fsOpen])

  React.useEffect(() => {
    const onFs = () => {
      if (!(document.fullscreenElement || document.webkitFullscreenElement) && fsOpen) toggleFs()
    }
    document.addEventListener('fullscreenchange', onFs)
    document.addEventListener('webkitfullscreenchange', onFs)
    return () => {
      document.removeEventListener('fullscreenchange', onFs)
      document.removeEventListener('webkitfullscreenchange', onFs)
    }
  }, [fsOpen, toggleFs])

  if (!track || !fsOpen) return null

  return (
    <div ref={ref} className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black">
      <NowPlayingCard variant="fullscreen" onFsToggle={toggleFs} />
    </div>
  )
}