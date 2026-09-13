import { onRequest } from 'firebase-functions/v2/https'
import { youtubeDl } from 'youtube-dl-exec'
import { createApi, DEFAULT_SOURCES } from './api.js'

const backend = {
  async searchPlaylist(input) {
    const data = await youtubeDl(input, {
      dumpSingleJson: true,
      flatPlaylist: true,
      noWarnings: true,
      skipDownload: true,
    })
    return data || { entries: [] }
  },

  async extractAudioUrl(url) {
    const out = await youtubeDl(url, {
      getUrl: true,
      format: 'bestaudio/best',
      noPlaylist: true,
      skipDownload: true,
      noWarnings: true,
    })
    const text = String(out ?? '').trim()
    return text.split('\n')[0] || ''
  },
}

const api = createApi(backend)

export const apiHandler = onRequest({ region: 'us-central1' }, api.handle)

export { DEFAULT_SOURCES }