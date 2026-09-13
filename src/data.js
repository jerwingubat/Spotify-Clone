function imgOf(seed) {
  return `https://picsum.photos/seed/${seed}/400/400`
}

export const playlists = [
  { id: 1, name: 'Today\'s Top Hits', desc: 'Doja Cat & sons in on track', color: '#e8115b', img: imgOf('tth') },
  { id: 2, name: 'RapCaviar', desc: 'New music from Bad Bunny, Drake +...', color: '#148a08', img: imgOf('rapcaviar') },
  { id: 3, name: 'All Out 2010s', desc: 'The biggest songs of the 2010s.', color: '#8d67ab', img: imgOf('allout2010s') },
  { id: 4, name: 'Rock Classics', desc: 'Rock legends & epic songs...', color: '#e13300', img: imgOf('rockclassics') },
  { id: 5, name: 'Chill Hits', desc: 'Kick back to the best new...', color: '#065996', img: imgOf('chillhits') },
  { id: 6, name: 'Peaceful Piano', desc: 'Relax and indulge with beautiful piano pieces', color: '#246bc4', img: imgOf('peacefulpiano') },
  { id: 7, name: 'Hip-Hop Central', desc: 'New and classic Hip-Hop', color: '#b02897', img: imgOf('hiphop') },
  { id: 8, name: 'Top Global', desc: 'The top tracks from around...', color: '#cd1a2b', img: imgOf('topglobal') },
  { id: 9, name: 'Indie Pop', desc: 'All things indie pop with...', color: '#503750', img: imgOf('indiepop') },
  { id: 10, name: 'Focus Flow', desc: 'Music for deep focus and flow', color: '#148a08', img: imgOf('focusflow') },
  { id: 11, name: 'Lo-fi Beats', desc: 'Beats to relax, study, and chill to', color: '#7d4b32', img: imgOf('lofi') },
  { id: 12, name: 'Night Rider', desc: 'Dance music for the drive home', color: '#0d73ec', img: imgOf('nightrider') },
]

export const artists = [
  { id: 1, name: 'Taylor Swift' },
  { id: 2, name: 'Drake' },
  { id: 3, name: 'Kendrick Lamar' },
  { id: 4, name: 'Billie Eilish' },
  { id: 5, name: 'The Weeknd' },
  { id: 6, name: 'Coldplay' },
  { id: 7, name: 'Beyoncé' },
  { id: 8, name: 'Radiohead' },
  { id: 9, name: 'Daft Punk' },
  { id: 10, name: 'Miles Davis' },
  { id: 11, name: 'Hans Zimmer' },
  { id: 12, name: 'Ariana Grande' },
  { id: 13, name: 'Frank Ocean' },
  { id: 14, name: 'SZA' },
  { id: 15, name: 'Dua Lipa' },
]

export const charts = [
  { rank: 1, title: 'Houdini', artist: 'Dua Lipa', plays: '76,582,411' },
  { rank: 2, title: 'Perro Negro', artist: 'Bad Bunny', plays: '120,302,141' },
  { rank: 3, title: 'LUNA', artist: 'FEID', plays: '98,222,031' },
  { rank: 4, title: 'Paint The Town', artist: 'A$AP Rocky', plays: '34,115,882' },
  { rank: 5, title: 'Cinderella', artist: 'Remi Wolf', plays: '24,213,000' },
]

export const songs = [
  { title: 'Houdini', artist: 'Dua Lipa', album: 'Houdini - Single', duration: '3:05', img: imgOf('houdini') },
  { title: 'Perro Negro', artist: 'Bad Bunny', album: 'nadie sabe lo que va a pasar mañana', duration: '2:42', img: imgOf('perronegro') },
  { title: 'Paint The Town', artist: 'A$AP Rocky', album: 'LIVE LOVE A$AP', duration: '3:26', img: imgOf('paint') },
  { title: 'LUNA', artist: 'FEID', album: 'FERXXO', duration: '2:46', img: imgOf('luna') },
  { title: 'Cinderella', artist: 'Remi Wolf', album: 'CinderELLA - Single', duration: '4:03', img: imgOf('cinderella') },
  { title: 'Snooze', artist: 'SZA', album: 'SOS', duration: '3:22', img: imgOf('snooze') },
  { title: 'Anti-Hero', artist: 'Taylor Swift', album: 'Midnights', duration: '3:21', img: imgOf('antihero') },
  { title: 'Paint It, Black', artist: 'The Rolling Stones', album: 'Aftermath', duration: '3:22', img: imgOf('black') },
  { title: 'Vampire', artist: 'Olivia Rodrigo', album: 'GUTS', duration: '3:40', img: imgOf('vampire') },
  { title: 'fukumean', artist: 'Gunna', album: 'a Gift & a Curse', duration: '2:05', img: imgOf('fukumean') },
]