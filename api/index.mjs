import { createApi } from '../functions/api.js'
import { spawnSync, execFile } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync, chmodSync } from 'node:fs'
import { join } from 'node:path'

const execFileAsync = (cmd, args) =>
  new Promise((resolve, reject) => {
    execFile(cmd, args, { maxBuffer: 1024 * 1024 * 32, timeout: 120_000 }, (err, stdout) =>
      err ? reject(err) : resolve(String(stdout || '')),
    )
  })

const execFileAsyncLine = (cmd, args) =>
  execFileAsync(cmd, args).then((out) => out.trim().split('\n')[0] || '')

const isWin = process.platform === 'win32'
const BIN_NAME = isWin ? 'yt-dlp.exe' : 'yt-dlp'

function checkVersion(bin) {
  try {
    const r = spawnSync(bin, ['--version'], { encoding: 'utf8', timeout: 15000, shell: false })
    const v = String(r.stdout || '').trim()
    if (r.status !== 0 || !/^\d{4}\.\d{2}(\d{2})?/.test(v)) return false
    return true
  } catch (_) {
    return false
  }
}

async function ensureYtDlp() {
  if (checkVersion(BIN_NAME)) return BIN_NAME

  const cached = join('/tmp', BIN_NAME)
  if (existsSync(cached) && checkVersion(cached)) return cached

  const bundled = join(process.cwd(), 'node_modules', 'youtube-dl-exec', 'bin', BIN_NAME)
  if (existsSync(bundled) && checkVersion(bundled)) return bundled

  const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${BIN_NAME}`
  console.log('[vercel] downloading yt-dlp from ' + url)
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`yt-dlp download failed: ${res.status}`)
  mkdirSync('/tmp', { recursive: true })
  writeFileSync(cached, Buffer.from(await res.arrayBuffer()))
  if (!isWin) chmodSync(cached, 0o755)
  if (!checkVersion(cached)) throw new Error('downloaded yt-dlp is not runnable')
  return cached
}

function makeBackend(ytDlpBin) {
  return {
    async searchPlaylist(input) {
      const { stdout } = await execFileAsync(ytDlpBin, ['-J', '--flat-playlist', '--no-warnings', input])
      return JSON.parse(stdout)
    },
    async extractAudioUrl(url) {
      const args = ['--get-url', '-f', 'bestaudio/best', '--no-playlist', '--no-warnings', '--extractor-args', 'youtube:player_client=android', url]
      try {
        return (await execFileAsyncLine(ytDlpBin, args)).trim()
      } catch (err) {
        return (await execFileAsyncLine(ytDlpBin, args)).trim()
      }
    },
  }
}

let backendPromise = null
function getBackend() {
  if (!backendPromise) {
    backendPromise = ensureYtDlp()
      .then(makeBackend)
      .catch((err) => {
        backendPromise = null
        throw err
      })
  }
  return backendPromise
}

export default async function handler(req, res) {
  try {
    const api = await getBackend()
    await api.handle(req, res)
  } catch (err) {
    if (!res.headersSent) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
    }
    res.end(JSON.stringify({ error: String(err.message || err) }))
  }
}