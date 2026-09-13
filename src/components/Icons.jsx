import React from 'react'

export const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-6v6H4.5A1.5 1.5 0 0 1 3 20z" />
  </svg>
)

export const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
)

export const LibraryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 6V4c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v2h6v16H3V6h6zm2 0h2V4h-2v2zm-5 4h2v2H6v-2zm0 4h2v2H6v-2zm0 4h2v2H6v-2zm12-4h-2v2h2v-2zm0 4h-2v2h2v-2z" />
  </svg>
)

export const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M15.25 8a.75.75 0 0 1-.75.75H8.75V14.5a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75H14.5a.75.75 0 0 1 .75.75z" />
  </svg>
)

export const ArrowIcon = ({ dir }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ transform: dir === 'left' ? 'rotate(180deg)' : undefined }}>
    <path d="M12 3v12.2l4.6-4.6 1.4 1.4-7 7-7-7 1.4-1.4 4.6 4.6V3z" />
  </svg>
)

export const ShuffleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M13.15 2.15a.5.5 0 0 1 .8.13l1 1.98a.5.5 0 0 1-.26.67l-1.98 1a.5.5 0 0 1-.67-.26l-.05-.1.6-.67h-1.1l-3.9 3.9L8 9.71z" />
  </svg>
)

export const SkipBackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z" />
  </svg>
)

export const PlayFilledIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#111">
    <path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z" />
  </svg>
)

export const SkipForwardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z" />
  </svg>
)

export const RepeatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5a3.75 3.75 0 0 1 3.75 3.75v.01a.75.75 0 0 1-1.5 0V4.75a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5.5a.75.75 0 0 1-1.5 0v-5.5zM16 11.25a.75.75 0 0 0-1.5 0 2.25 2.25 0 0 1-2.25 2.25h-8.5A2.25 2.25 0 0 1 1.5 11.25v-1.45a.75.75 0 0 0-1.5 0v1.45a3.75 3.75 0 0 0 3.75 3.75h8.5a3.75 3.75 0 0 0 3.75-3.75z" />
    <path d="M11.22 2.22a.75.75 0 0 1 1.06 0l1.5 1.5a.75.75 0 0 1 0 1.06l-1.5 1.5a.75.75 0 1 1-1.06-1.06l.72-.72H5.5a.75.75 0 0 1 0-1.5h6.44zM.78 7.56l.73.72 6.01-.01a.75.75 0 0 0 0-1.5L1.5 6.8l-.72-.72a.75.75 0 1 0-1.06 1.06z" />
  </svg>
)

export const VolumeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M9.741.85a.75.75 0 0 0 0 1.5v-1.5zm0 13.8a.75.75 0 0 0 0-1.5v1.5zM6.076 11.402a.75.75 0 0 0-1.049 1.072l1.05-1.072zm7.02-7.164a.75.75 0 1 0-1.03 1.09l1.03-1.09zM6.7 9.7a.75.75 0 0 0 0-1.5v1.5Zm0-2.4a.75.75 0 0 0 0 1.5v-1.5zM1 3.5h2.5a.75.75 0 0 0 0-1.5H1v1.5zm0 9h2.5v-1.5H1v1.5zM9.741 2.398a5.618 5.618 0 0 0-4.635 2.757l1.052.75a4.118 4.118 0 0 1 3.583-2.007v-1.5zm0 13.204a5.618 5.618 0 0 1-4.635-2.757l1.052-.75a4.118 4.118 0 0 0 3.583 2.007v1.5zM3.5 3.5v9H5v-9H3.5zm0 0H1v1.5h2.5v-1.5zM5.5 6.6h1.2v1.5H5.5V6.6zm0 2.4h1.2v1.5H5.5V9zm-4.5 0h2.5V7.5H1v1.5zM4.366 3.155a7.99 7.99 0 0 1 6.125-1.93L10.5 2.5l.66-1.16L10.493 1a9.49 9.49 0 0 0-7.274 2.296l1.147 1.012zM10.5 2.5l.626-2.18.008.002 1.766.506-.634 2.18L10.5 2.5zm2.595-.502.02 3.004-1-.006-.02-3.004 1 .006zM12.508 5.502l.016.326.99-1.09-1.006.764z" />
  </svg>
)

export const HeartIcon = ({ filled }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill={filled ? '#1ed760' : 'none'} stroke={filled ? 'none' : '#fff'} strokeWidth="1.5">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

export const MoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="19" cy="12" r="1.5" />
    <circle cx="4" cy="19" r="1" fill="#1db954" />
  </svg>
)

export const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm0 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.2 2l3.47 6.01-5 2.89L8 6.53z" />
  </svg>
)