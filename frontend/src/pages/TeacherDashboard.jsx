import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { api } from '../api'

function Header() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  return (
    <div className="app-header">
      <div className="brand">Spandan</div>
      <div className="user-chip">
        <span>👨‍🏫 {user?.name}</span>
        <button
          className="btn btn-secondary"
          style={{ padding: '4px 10px', fontSize: 12 }}
          onClick={() => { logout(); navigate('/') }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  const load = async () => {
    try {
      const { rooms } = await api.myRooms()
      setRooms(rooms)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const create = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const { room } = await api.createRoom(newName.trim())
      navigate(`/teacher/room/${room._id}`)
    } catch (e) {
      alert(e.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <Header />
      <div className="container">
        <h2 style={{ marginTop: 0 }}>Teacher Dashboard</h2>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Create a new room</h3>
          <form onSubmit={create} style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              placeholder="Room name (e.g. Physics — Ch. 4)"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
            <button className="btn" disabled={creating} type="submit">
              {creating ? 'Creating…' : 'Create Room'}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Your rooms</h3>
          {loading ? (
            <div className="empty-state">Loading…</div>
          ) : rooms.length === 0 ? (
            <div className="empty-state">No rooms yet. Create one above to get started.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rooms.map(r => (
                <div
                  key={r._id}
                  className="q-card"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => navigate(`/teacher/room/${r._id}`)}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
                      Code: <span className="room-code-display" style={{ fontSize: 14, padding: '2px 8px', letterSpacing: 2 }}>{r.code}</span>
                      {'  '} • {r.isActive ? '🟢 Active' : '⚫ Ended'} • {new Date(r.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button className="btn btn-secondary">Open →</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
