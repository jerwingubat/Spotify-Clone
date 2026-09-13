export async function proxiedText(url) {
  const r = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(url))
  if (!r.ok) throw new Error(`proxy returned HTTP ${r.status}`)
  return r.text()
}

export function unescapeHtmlEntities(str) {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

export function fmtDuration(secs) {
  if (!secs || !Number.isFinite(secs)) return '–'
  const m = Math.floor(secs / 60)
  const s = Math.round(secs % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}