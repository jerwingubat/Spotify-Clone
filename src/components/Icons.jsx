import React from 'react'

export const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-6v6H4.5A1.5 1.5 0 0 1 3 20z" />
  </svg>
)

export const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
)

export const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
  </svg>
)

export const LibraryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.5 3c1.95 0 4.05.4 5.5 1.5 1.45-1.1 3.55-1.5 5.5-1.5C15.45 3.9 13.1 4.5 12 4.5 10.9 4.5 8.55 3.9 6.5 3z" />
    <path d="M1 6.5v14.15C1 20.77 1.3 21 1.6 21c.1 0 .2-.03.29-.08C3.71 19.7 5.05 19.5 6.5 19.5c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.09.05.19.08.29.08.3 0 .46-.23.46-.43V6.5C21.85 6.05 21.2 5.75 20 5.25v12.35c-.35.05-.7.08-1.05.08-1.7 0-4.15.65-5.5 1.5V7c1.45-1.1 3.55-1.5 5.5-1.5.35 0 .7.02 1.05.08.6.21 1.05.42 1.5.42V4.5C20.2 4.28 19.6 4.05 19 3.85v1.66C17.6 5.2 16.25 5 15 5c-1.7 0-4.15.65-5.5 1.5C8.15 5.65 5.7 5 4 5c-1.25 0-2.6.2-3 3.5z" />
  </svg>
)

export const PlusIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1.5a.75.75 0 0 1 .75.75v5h5a.75.75 0 0 1 0 1.5h-5v5a.75.75 0 0 1-1.5 0v-5h-5a.75.75 0 0 1 0-1.5h5v-5A.75.75 0 0 1 8 1.5z" />
  </svg>
)

export const ArrowIcon = ({ dir }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ transform: dir === 'left' ? 'rotate(180deg)' : undefined }}>
    <path d="M12 3v12.2l4.6-4.6 1.4 1.4-7 7-7-7 1.4-1.4 4.6 4.6V3z" />
  </svg>
)

export const ShuffleIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
  </svg>
)

export const SkipBackIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z" />
  </svg>
)

export const SkipForwardIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z" />
  </svg>
)

export const PlayFilledIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#111">
    <path d="M7.05 3.6l13.49 7.79a.7.7 0 0 1 0 1.22L7.05 20.4A.7.7 0 0 1 6 19.79V4.21a.7.7 0 0 1 1.05-.61z" />
  </svg>
)

export const RepeatIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
  </svg>
)

export const VolumeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
)

export const HeartIcon = ({ filled, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#1ed760' : 'none'} stroke={filled ? 'none' : '#fff'} strokeWidth="1.5">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

export const MoreIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
)

export const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm0 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.4 2.5h1v5.26l3.55 2.05-.5.86-4.05-2.34V3.5z" />
  </svg>
)

export const CrossIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M2.28 2.28a.75.75 0 0 1 1.06 0L8 6.94l4.66-4.66a.75.75 0 1 1 1.06 1.06L9.06 8l4.66 4.66a.75.75 0 1 1-1.06 1.06L8 9.06l-4.66 4.66a.75.75 0 0 1-1.06-1.06L6.94 8 2.28 3.34a.75.75 0 0 1 0-1.06z" />
  </svg>
)

export const PlaylistIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 6a1 1 0 0 1 1-1h13a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h13a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h9a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h9a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm10.5-5.66V7.51A1.01 1.01 0 0 1 14.49 6.5h.02L19 6.5c.55 0 1 .45.99 1.01L20 10a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v1.34zm4.5-2.34l-2 .02V15.5c0 .97-.78 1.75-1.75 1.75H12v3l-2-2h3.25A3.75 3.75 0 0 0 17 14.75V12.34z" />
  </svg>
)

export const ExpandIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
  </svg>
)

export const ContractIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3v3a2 2 0 0 1-2 2H3" />
    <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
    <path d="M3 16h3a2 2 0 0 1 2 2v3" />
    <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
  </svg>
)