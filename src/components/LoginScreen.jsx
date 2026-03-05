import { useState } from 'react'

const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD || 'sogeray2026'

export default function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      if (password === APP_PASSWORD) {
        sessionStorage.setItem('devis_auth', 'true')
        onLogin()
      } else {
        setError('Mot de passe incorrect')
        setPassword('')
      }
      setLoading(false)
    }, 400)
  }

  return (
    <div className="login-overlay">
      <div className="login-box">
        <div className="login-logo">
          <div className="logo-icon">
            <div className="orbit orbit-red"></div>
            <div className="orbit orbit-gray"></div>
            <div className="core"></div>
          </div>
          <div className="logo-text">
            <span className="brand-name">SOGERAY</span>
            <span className="brand-sub">Générateur de Devis</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">
            Mot de passe
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              placeholder="Entrez le mot de passe..."
              autoFocus
              className="login-input"
            />
          </label>
          {error && <div className="login-error">{error}</div>}
          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading || !password}
          >
            {loading ? 'Vérification...' : '🔓 Accéder'}
          </button>
        </form>
      </div>
    </div>
  )
}
