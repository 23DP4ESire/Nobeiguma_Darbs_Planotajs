import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import './Profile.css'

export default function Profile({ user, onUserUpdate }) {
  const navigate = useNavigate()
  const [profileUser, setProfileUser] = useState(user)
  const [name, setName] = useState(user?.name || '')
  const [usernameCurrentPassword, setUsernameCurrentPassword] = useState('')
  const [passwordCurrentPassword, setPasswordCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingUsername, setEditingUsername] = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: null,
    title: '',
    message: '',
  })

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      try {
        const response = await axiosClient.get('/me')

        if (!isMounted) {
          return
        }

        setProfileUser(response.data.user)
        setName(response.data.user?.name || '')
        setLoading(false)
      } catch {
        if (!isMounted) {
          return
        }

        setError('Jūsu sesija nav aktīva. Lūdzu, pierakstieties vēlreiz.')
        setLoading(false)
        setTimeout(() => navigate('/'), 1200)
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [navigate])

  const isAdmin = Boolean(profileUser?.is_admin)

  const resetDialog = () => {
    setConfirmDialog({
      open: false,
      type: null,
      title: '',
      message: '',
    })
  }

  const openDialog = (type) => {
    if (type === 'username') {
      setConfirmDialog({
        open: true,
        type,
        title: 'Apstiprināt lietotājvārda maiņu',
        message: 'Vai tiešām vēlaties saglabāt jauno lietotājvārdu?',
      })
      return
    }

    setConfirmDialog({
      open: true,
      type,
      title: 'Apstiprināt paroles maiņu',
      message: 'Vai tiešām vēlaties saglabāt jauno paroli?',
    })
  }

  const handleUpdateUsername = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (name.length < 4) {
      setError('Lietotājvārdā jābūt vismaz 4 rakstzīmēm.')
      return
    }

    if (!usernameCurrentPassword) {
      setError('Lai apstiprinātu lietotājvārda maiņu, jāievada pašreizējā parole.')
      return
    }

    openDialog('username')
  }

  const handleUpdatePassword = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Jaunā parole un apstiprinājums nesakrīt.')
      return
    }

    if (newPassword.length < 6) {
      setError('Parolei jābūt vismaz 6 rakstzīmes garai.')
      return
    }

    if (!passwordCurrentPassword) {
      setError('Lai apstiprinātu paroles maiņu, jāievada pašreizējā parole.')
      return
    }

    openDialog('password')
  }

  const confirmUpdate = async () => {
    const selectedType = confirmDialog.type

    if (!selectedType) {
      return
    }

    setSaving(true)
    setError('')

    try {
      const response =
        selectedType === 'username'
          ? await axiosClient.put('/profile/username', {
              name,
              current_password: usernameCurrentPassword,
            })
          : await axiosClient.put('/profile/password', {
              current_password: passwordCurrentPassword,
              password: newPassword,
              password_confirmation: confirmPassword,
            })

      const updatedUser = response.data.user

      setProfileUser(updatedUser)
      setName(updatedUser?.name || '')
      setUsernameCurrentPassword('')
      setPasswordCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setEditingUsername(false)
      setEditingPassword(false)
      setSuccess(selectedType === 'username' ? 'Lietotājvārds veiksmīgi atjaunināts!' : 'Parole veiksmīgi atjaunināta!')
      localStorage.setItem('user', JSON.stringify(updatedUser))

      if (onUserUpdate) {
        onUserUpdate(updatedUser)
      }

      resetDialog()
    } catch (updateError) {
      const responseMessage = updateError?.response?.data?.message
      const validationErrors = updateError?.response?.data?.errors
      const firstValidationError = validationErrors ? Object.values(validationErrors).flat()[0] : ''

      setError(firstValidationError || responseMessage || 'Neizdevās atjaunināt profilu.')
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setEditingUsername(false)
    setEditingPassword(false)
    setName(profileUser?.name || '')
    setUsernameCurrentPassword('')
    setPasswordCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    resetDialog()
  }

  if (loading) {
    return (
      <main className="profile-page">
        <section className="profile-card profile-loading">
          <p>Ielādē profilu...</p>
        </section>
      </main>
    )
  }

  return (
    <main className="profile-page">
      <section className="profile-card">
        <div className="profile-badge">Profils</div>
        <h1>Sveiki, {profileUser?.name || 'lietotāj'}!</h1>
        <p className="profile-intro">
          Šī ir jūsu privātā profila lapa. Noklikšķiniet uz pogām, lai mainītu datus.
        </p>

        {error && <p className="profile-error">{error}</p>}
        {success && <p className="profile-success">{success}</p>}

        <div className="profile-info-grid">
          <div className="profile-info-item profile-static-item">
            <span className="profile-label">E-pasts</span>
            <strong>{profileUser?.email}</strong>
          </div>
          <div className="profile-info-item profile-static-item">
            <span className="profile-label">Konta piekļuve</span>
            <strong>{isAdmin ? 'Administrators' : 'Standarta lietotājs'}</strong>
          </div>
        </div>

        <div className="profile-section">
          <h3 className="profile-section-title">Lietotājvārds</h3>
          {!editingUsername && (
            <div className="profile-section-display">
              <span className="profile-display-value">{profileUser?.name}</span>
            </div>
          )}
          {editingUsername && (
            <form className="profile-section-form" onSubmit={handleUpdateUsername}>
              <label className="profile-field">
                <span className="profile-label">Jaunais lietotājvārds</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="profile-input"
                  required
                  minLength={4}
                  autoFocus
                />
              </label>
              <label className="profile-field">
                <span className="profile-label">Pašreizējā parole</span>
                <input
                  type="password"
                  value={usernameCurrentPassword}
                  onChange={(event) => setUsernameCurrentPassword(event.target.value)}
                  className="profile-input"
                  required
                />
              </label>
              <div className="profile-section-actions">
                <button type="button" className="profile-cancel-button" onClick={cancelEdit} disabled={saving}>
                  Atcelt
                </button>
                <button type="submit" className="profile-save-button" disabled={saving}>
                  {saving ? 'Pārbauda...' : 'Turpināt'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="profile-section">
          <h3 className="profile-section-title">Parole</h3>
          {!editingPassword && (
            <div className="profile-section-display">
              <span className="profile-display-value">••••••••</span>
            </div>
          )}
          {editingPassword && (
            <form className="profile-section-form" onSubmit={handleUpdatePassword}>
              <label className="profile-field">
                <span className="profile-label">Pašreizējā parole</span>
                <input
                  type="password"
                  value={passwordCurrentPassword}
                  onChange={(event) => setPasswordCurrentPassword(event.target.value)}
                  className="profile-input"
                  required
                  autoFocus
                />
              </label>
              <label className="profile-field">
                <span className="profile-label">Jaunā parole</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="profile-input"
                  required
                  minLength={6}
                />
              </label>
              <label className="profile-field">
                <span className="profile-label">Apstipriniet jauno paroli</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="profile-input"
                  required
                  minLength={6}
                />
              </label>
              <div className="profile-section-actions">
                <button type="button" className="profile-cancel-button" onClick={cancelEdit} disabled={saving}>
                  Atcelt
                </button>
                <button type="submit" className="profile-save-button" disabled={saving}>
                  {saving ? 'Pārbauda...' : 'Turpināt'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="profile-bottom-actions">
          <button
            type="button"
            className="profile-edit-button"
            onClick={() => {
              setEditingUsername((value) => !value)
              setEditingPassword(false)
              setPasswordCurrentPassword('')
              setNewPassword('')
              setConfirmPassword('')
              setError('')
              resetDialog()
            }}
            disabled={editingPassword}
          >
            {editingUsername ? 'Atcelt' : 'Mainīt lietotājvārdu'}
          </button>
          <button
            type="button"
            className="profile-edit-button"
            onClick={() => {
              setEditingPassword((value) => !value)
              setEditingUsername(false)
              setUsernameCurrentPassword('')
              setError('')
              resetDialog()
            }}
            disabled={editingUsername}
          >
            {editingPassword ? 'Atcelt' : 'Mainīt paroli'}
          </button>
        </div>

        {isAdmin && (
          <div className="profile-admin-note">
            Jums ir admin piekļuve nākotnes satura pārvaldībai.
          </div>
        )}

        {confirmDialog.open && (
          <div className="profile-confirm-overlay" onClick={resetDialog}>
            <div className="profile-confirm-modal" onClick={(event) => event.stopPropagation()}>
              <h3>{confirmDialog.title}</h3>
              <p>{confirmDialog.message}</p>
              <div className="profile-confirm-actions">
                <button type="button" className="profile-cancel-button" onClick={resetDialog} disabled={saving}>
                  Atcelt
                </button>
                <button type="button" className="profile-save-button" onClick={confirmUpdate} disabled={saving}>
                  {saving ? 'Saglabā...' : 'Apstiprināt'}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
