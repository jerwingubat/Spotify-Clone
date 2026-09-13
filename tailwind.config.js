/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        spotify: '#1ed760',
        panel: '#121212',
        'panel-elevated': '#181818',
        'panel-hover': '#282828',
        sc: '#ff5500',
        yt: '#ff0000',
        bc: '#629aa9',
      },
      fontFamily: {
        sans: [
          'Circular',
          'Spotify Mix',
          'CircularSpotify',
          'Plus Jakarta Sans',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}