import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000',
            color: '#fff',
            fontFamily: 'Helvetica, Arial, sans-serif',
            gap: '16px',
            textAlign: 'center',
            padding: '24px',
          }}
        >
          <h1 style={{ fontSize: '22px' }}>Something went wrong</h1>
          <p style={{ color: '#b3b3b3', fontSize: '13px', maxWidth: '480px' }}>
            {String(this.state.error.message || this.state.error)}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#1ed760',
              color: '#000',
              fontWeight: 700,
              border: 'none',
              borderRadius: '32px',
              padding: '10px 24px',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)