import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { api } from '../api'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)
  const [joining, setJoining] = useState(false)

  const join = async (e) => {
    e.preventDefault()
    if (!code.trim()) return
    setError(null)
    setJoining(true)
    try {
      const { room } = await api.joinRoom(code.trim().toUpperCase())
      navigate(`/student/session/${room.code}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setJoining(false)
    }
  }

  return (
    <>
      <div className="app-header">
        <div className="brand">Spandan</div>
        <div className="user-chip">
          <span>🎓 {user?.name}</span>
          <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => { logout(); navigate('/') }}>Logout</button>
        </div>
      </div>

      <div className="container">
        <h2 style={{ marginTop: 0 }}>Join a Session</h2>

        <div className="card" style={{ maxWidth: 480 }}>
          <form onSubmit={join}>
            <div className="form-group">
              <label className="label">Room Code</label>
              <input
                className="input"
                placeholder="Enter 6-character code"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                style={{ fontSize: 24, textAlign: 'center', letterSpacing: 6, fontFamily: 'Courier New, monospace' }}
              />
            </div>
            {error && <div className="error-banner">{error}</div>}
            <button className="btn btn-block" disabled={joining || code.length < 4} type="submit">
              {joining ? 'Joining…' : 'Join Session'}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Your Points</h3>
          <div style={{ fontSize: 40, fontWeight: 700, color: 'var(--primary)' }}>
            {user?.totalPoints || 0}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>Earn points by answering questions correctly and quickly!</div>
        </div>
      </div>
    </>
  )
}
