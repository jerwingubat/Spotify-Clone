import { youtubeDl } from 'youtube-dl-exec'

export function createBackend() {
  return {
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
        extractorArgs: 'youtube:player_client=android',
      })
      const text = String(out ?? '').trim()
      return text.split('\n')[0] || ''
    },
  }
}