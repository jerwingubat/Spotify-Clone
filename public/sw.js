const CACHE = 'spotibai-v3'
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/spotibai.png', '/icon-192.png', '/icon-512.png', '/icon-512-maskable.png', '/apple-touch-icon.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

async function networkFirst(request, fallback) {
  try {
    const res = await fetch(request)
    if (res.ok) {
      const cache = await caches.open(CACHE)
      cache.put(fallback || request, res.clone())
    }
    return res
  } catch (err) {
    const cached = (await caches.match(request)) || (await caches.match(fallback || '/index.html'))
    return cached || Response.error()
  }
}

async function refresh(cache, request) {
  try {
    const res = await fetch(request)
    if (res.ok || res.type === 'opaque') {
      cache.put(request, res)
      const keys = await cache.keys()
      if (keys.length > 300) await cache.delete(keys[0])
    }
  } catch (err) {
    /* offline */
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE)
  const cached = await cache.match(request)
  if (cached) {
    refresh(cache, request)
    return cached
  }
  const res = await fetch(request).catch(() => Response.error())
  if (res.ok || res.type === 'opaque') cache.put(request, res.clone())
  return res
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  if (url.origin === location.origin) {
    if (url.pathname.startsWith('/api')) return
    if (request.mode === 'navigate') {
      event.respondWith(networkFirst(request, '/index.html'))
      return
    }
    event.respondWith(staleWhileRevalidate(request))
    return
  }

  event.respondWith(staleWhileRevalidate(request))
})