import React from 'react'
import NowPlayingCard from './NowPlayingCard.jsx'
import { usePlayer } from '../store/PlayerContext.jsx'

export default function PlayingNow() {
  const { track, toggleFs } = usePlayer()

  if (!track) return null

  return (
    <section className="mb-8">
      <div className="mb-4">
        <h2 className="text-[22px] font-extrabold tracking-tight">Playing now</h2>
      </div>

      <NowPlayingCard variant="card" onFsToggle={toggleFs} />
    </section>
  )
}