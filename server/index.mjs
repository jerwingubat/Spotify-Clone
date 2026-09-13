import http from 'node:http'
import { spawnSync, execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { createReadStream, existsSync, statSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, normalize, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApi } from '../functions/api.js'

const execFileAsync = promisify(execFile)
const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = join(__dirname, '..')
const DIST = join(ROOT, 'dist')
const PORT = process.env.PORT || 3000

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.map': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

/* ---------- yt-dlp bootstrap (no system install required) ---------- */

const isWin = process.platform === 'win32'
const isMac = process.platform === 'darwin'
const BIN_NAME = isWin ? 'yt-dlp.exe' : isMac ? 'yt-dlp_macos' : 'yt-dlp_linux'
const CACHE_DIR = join(ROOT, 'node_modules', '.cache', 'ytdlp')

function checkVersion(bin) {
  try {
    const r = spawnSync(bin, ['--version'], { encoding: 'utf8', timeout: 15000, shell: false })
    const v = String(r.stdout || '').trim()
    if (r.status !== 0 || !/^\d{4}\.\d{2}(\d{2})?/.test(v)) {
      console.log(`[bonto] yt-dlp probe rejected ${bin}: status=${r.status} out=${JSON.stringify(v.slice(0, 40))} err=${JSON.stringify(String(r.stderr || '').slice(0, 120))}`)
      return false
    }
    return true
  } catch (err) {
    console.log(`[bonto] yt-dlp probe threw for ${bin}: ${String(err.message).slice(0, 120)}`)
    return false
  }
}

async function ensureYtDlp() {
  if (checkVersion(BIN_NAME)) return BIN_NAME

  const cached = join(CACHE_DIR, BIN_NAME)
  if (existsSync(cached) && checkVersion(cached)) return cached

  const bundled = join(ROOT, 'node_modules', 'youtube-dl-exec', 'bin', BIN_NAME)
  if (existsSync(bundled) && checkVersion(bundled)) return bundled

  const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${BIN_NAME}`
  console.log(`[bonto] downloading yt-dlp from ${url}`)
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`yt-dlp download failed: ${res.status}`)
  mkdirSync(CACHE_DIR, { recursive: true })
  writeFileSync(cached, Buffer.from(await res.arrayBuffer()))
  if (!isWin) {
    const { chmodSync } = await import('node:fs')
    chmodSync(cached, 0o755)
  }
  if (!checkVersion(cached)) throw new Error('downloaded yt-dlp is not runnable')
  return cached
}

function makeBackend(ytDlpBin) {
  const base = ['--no-warnings', '--no-cache-dir', '--no-update']
  const runOpts = {
    maxBuffer: 1024 * 1024 * 32,
    timeout: 120_000,
    env: { ...process.env, HOME: '/tmp', XDG_CONFIG_HOME: '/tmp/xdg-config', XDG_CACHE_HOME: '/tmp/xdg-cache' },
  }
  return {
    async searchPlaylist(input) {
      const { stdout } = await execFileAsync(
        ytDlpBin,
        ['-J', '--flat-playlist', ...base, input],
        runOpts,
      )
      return JSON.parse(stdout)
    },

    async extractAudioUrl(url) {
      const args = ['--get-url', '-f', 'bestaudio/best', '--no-playlist', ...base, '--extractor-args', 'youtube:player_client=android', url]
      const run = () => execFileAsync(ytDlpBin, args, runOpts)
      let out
      try {
        out = await run()
      } catch (err) {
        out = await run()
      }
      return String(out.stdout || '').trim().split('\n')[0] || ''
    },
  }
}

/* ---------- static serving ---------- */

function safeJoin(p) {
  let rel
  try {
    rel = decodeURIComponent(p).replace(/^\/+/, '')
  } catch (_) {
    return null
  }
  const abs = join(DIST, normalize(rel))
  if (!abs.startsWith(DIST)) return null
  return abs
}

function tryPath(abs) {
  if (abs && existsSync(abs) && statSync(abs).isFile()) return abs
  if (abs && existsSync(abs) && statSync(abs).isDirectory()) {
    const idx = join(abs, 'index.html')
    if (existsSync(idx) && statSync(idx).isFile()) return idx
  }
  return null
}

/* ---------- boot ---------- */

async function ensureBuild() {
  if (existsSync(join(DIST, 'index.html'))) return

  const viteJs = join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js')
  if (existsSync(viteJs)) {
    console.log('[bonto] dist missing, running `vite build`…')
    const r = spawnSync(process.execPath, [viteJs, 'build'], {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: 600_000,
    })
    if (r.status !== 0) throw new Error(`vite build failed: ${String(r.stderr || r.stdout || '').slice(0, 1000)}`)
    return
  }

  const npmCli = join(ROOT, 'node_modules', 'npm', 'bin', 'npm-cli.js')
  if (existsSync(npmCli)) {
    console.log('[bonto] dist missing, running `npm run build`…')
    const r = spawnSync(process.execPath, [npmCli, 'run', 'build'], {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: 600_000,
    })
    if (r.status !== 0) throw new Error(`vite build failed: ${String(r.stderr || r.stdout || '').slice(0, 1000)}`)
    return
  }

  throw new Error('no vite install found (node_modules missing?)')
}

async function start() {
  await ensureBuild()
  const ytDlpBin = await ensureYtDlp()
  const api = createApi(makeBackend(ytDlpBin))

  const server = http.createServer((req, res) => {
    const u = new URL(req.url, `http://${req.headers.host || 'localhost'}`)

    if (u.pathname.startsWith('/api')) {
      return api.handle(req, res).catch((err) => {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: String(err.message || err) }))
      })
    }

    const file = tryPath(safeJoin(u.pathname)) || join(DIST, 'index.html')
    if (!existsSync(file)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      return res.end('Not found')
    }

    res.setHeader('Content-Type', MIME[extname(file).toLowerCase()] || 'application/octet-stream')
    createReadStream(file).pipe(res)
  })

  server.listen(PORT, () => {
    console.log(`[bonto] listening on :${PORT} (static + /api) yt-dlp=${ytDlpBin}`)
  })
}

start().catch((err) => {
  console.error('[bonto] boot failed:', err)
  process.exit(1)
})