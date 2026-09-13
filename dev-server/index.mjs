import http from 'node:http'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { createApi } from '../functions/api.js'

const execFileAsync = promisify(execFile)
const PORT = process.env.PORT || 3002

const backend = {
  async searchPlaylist(input) {
    const { stdout } = await execFileAsync('yt-dlp', ['-J', '--flat-playlist', '--no-warnings', input], {
      maxBuffer: 1024 * 1024 * 32,
      timeout: 90_000,
    })
    return JSON.parse(stdout)
  },

  async extractAudioUrl(url) {
    const { stdout } = await execFileAsync(
      'yt-dlp',
      ['--get-url', '-f', 'bestaudio/best', '--no-playlist', '--no-warnings', '--extractor-args', 'youtube:player_client=android', url],
      { maxBuffer: 1024 * 1024 * 32, timeout: 120_000 },
    )
    return stdout.trim().split('\n')[0] || ''
  },
}

const api = createApi(backend)

const server = http.createServer((req, res) => {
  api.handle(req, res).catch((err) => {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: String(err.message || err) }))
  })
})

server.listen(PORT, () => {
  console.log(`[audio-api dev] http://localhost:${PORT}  (yt-dlp: search + extract)`)
})