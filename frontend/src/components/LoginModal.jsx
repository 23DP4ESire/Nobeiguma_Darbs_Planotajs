import { useState } from 'react'
import './LoginModal.css'

function LoginModal({ isOpen, onClose }) {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const API_BASE_URL = '/api'

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage('Veiksmīgi pierakstījāties!')
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setTimeout(() => {
          onClose()
          window.location.reload()
        }, 1500)
      } else {
        setError(data.message || 'Nepareizs e-pasts vai parole. Mēģiniet vēlreiz vai izveidojiet jaunu kontu.')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Kļūda savienojumā ar serveri. Pārbaudiet, vai backend serveris darbojas uz localhost:8000')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: username,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage('Konts veiksmīgi izveidots! Pierakstīšanās...')
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setTimeout(() => {
          onClose()
          window.location.reload()
        }, 1500)
      } else {
        setError(data.message || 'Kļūda kontu izveidojot. Mēģiniet vēlreiz.')
      }
    } catch (err) {
      console.error('Register error:', err)
      setError('Kļūda savienojumā ar serveri. Mēģiniet vēlreiz.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>

        <div className="modal-header">
          <h2>{isLoginMode ? 'Pierakstīties' : 'Izveidot kontu'}</h2>
        </div>

        <form onSubmit={isLoginMode ? handleLogin : handleRegister} className="login-form">
          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="username">Lietotājvārds</label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ievadiet lietotājvārdu"
                autoComplete="username"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">E-pasts</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ievadiet e-pastu"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Parole</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ievadiet paroli"
              autoComplete={isLoginMode ? "current-password" : "new-password"}
              required
            />
          </div>

          {isLoginMode && (
            <a href="#forgot" className="forgot-password">
              Aizmirsu paroli?
            </a>
          )}

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Ielādē...' : isLoginMode ? 'Pierakstīties' : 'Izveidot kontu'}
          </button>
        </form>

        <div className="modal-footer">
          {isLoginMode ? (
            <>
              Nav konta?{' '}
              <button
                type="button"
                className="toggle-mode"
                onClick={() => {
                  setIsLoginMode(false)
                  setError('')
                  setSuccessMessage('')
                }}
              >
                Izveidot jaunu
              </button>
            </>
          ) : (
            <>
              Jau ir konts?{' '}
              <button
                type="button"
                className="toggle-mode"
                onClick={() => {
                  setIsLoginMode(true)
                  setError('')
                  setSuccessMessage('')
                }}
              >
                Pierakstīties
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginModal
