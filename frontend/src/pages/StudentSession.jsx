import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useAuthStore } from '../stores/authStore'
import { api } from '../api'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (window.location.protocol + '//' + window.location.host)

export default function StudentSession() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const { user, token, logout } = useAuthStore()
  const [room, setRoom] = useState(null)
  const [activeQuestion, setActiveQuestion] = useState(null)
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null) // {isCorrect, pointsAwarded}
  const [leaderboard, setLeaderboard] = useState([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [closed, setClosed] = useState(false)
  const startedAtRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!token) return
    api.getRoom(roomCode).then(({ room }) => setRoom(room)).catch(console.error)
  }, [roomCode, token])

  useEffect(() => {
    if (!token || !room) return
    const s = io(SOCKET_URL, { auth: { token } })
    socketRef.current = s

    s.on('connect', () => {
      s.emit('room:join', { roomCode: room.code, name: user?.name })
    })

    s.on('question:launched', (q) => {
      setActiveQuestion(q)
      setSelected(null)
      setSubmitted(false)
      setResult(null)
      setClosed(false)
      startedAtRef.current = Date.now()
      setTimeLeft(q.timeLimit || 30)
      // Refresh leaderboard
      api.getLeaderboard(room._id).then(({ leaderboard }) => setLeaderboard(leaderboard)).catch(() => {})
    })

    s.on('question:closed', () => {
      setClosed(true)
    })

    return () => s.disconnect()
  }, [token, room, user])

  // Countdown timer
  useEffect(() => {
    if (!activeQuestion || submitted) return
    if (timeLeft <= 0) {
      if (!submitted && !closed) setClosed(true)
      return
    }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, activeQuestion, submitted, closed])

  const submit = async () => {
    if (selected === null || submitted) return
    setSubmitted(true)
    try {
      const responseTimeMs = Date.now() - (startedAtRef.current || Date.now())
      const r = await api.submitResponse({
        questionId: activeQuestion._id,
        selectedOption: selected,
        responseTimeMs
      })
      setResult({ isCorrect: r.isCorrect, pointsAwarded: r.pointsAwarded })
    } catch (e) {
      console.error(e)
      setResult({ isCorrect: false, pointsAwarded: 0 })
    }
  }

  if (!room) {
    return <div className="container"><div className="card">Loading session…</div></div>
  }

  return (
    <>
      <div className="app-header">
        <div className="brand">Spandan</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>{room.name}</span>
          <span className="user-chip"><span>🎓 {user?.name}</span><span style={{ color: 'var(--primary)', fontWeight: 700 }}>{user?.totalPoints || 0} pts</span></span>
          <button className="btn btn-secondary" onClick={() => { logout(); navigate('/') }}>Logout</button>
        </div>
      </div>

      <div className="container">
        {!activeQuestion ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>⏳</div>
            <h2 style={{ margin: 0 }}>Waiting for your teacher…</h2>
            <p style={{ color: 'var(--text-dim)', marginTop: 12 }}>
              The session will start when the teacher launches a question.
            </p>
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>Connected to room</div>
              <div className="room-code-display">{room.code}</div>
            </div>
          </div>
        ) : (
          <>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>QUESTION · {activeQuestion.points} pts</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>{activeQuestion.question}</div>
              <div className={'timer' + (timeLeft <= 5 ? ' urgent' : '')}>{timeLeft}s</div>
            </div>

            <div className="card">
              {activeQuestion.options.map((o, i) => {
                let cls = 'option-btn'
                if (submitted || closed) {
                  if (o.isCorrect) cls += ' correct'
                  else if (selected === i) cls += ' incorrect'
                } else if (selected === i) cls += ' selected'
                return (
                  <button
                    key={i}
                    className={cls}
                    disabled={submitted || closed}
                    onClick={() => setSelected(i)}
                  >
                    <strong style={{ marginRight: 12 }}>{String.fromCharCode(65 + i)}.</strong> {o.text}
                  </button>
                )
              })}

              {!submitted && !closed && (
                <button
                  className="btn btn-block"
                  disabled={selected === null || timeLeft === 0}
                  onClick={submit}
                  style={{ marginTop: 12 }}
                >
                  Submit Answer
                </button>
              )}

              {submitted && result && (
                <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: result.isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)', border: '1px solid ' + (result.isCorrect ? 'var(--success)' : 'var(--danger)') }}>
                  {result.isCorrect ? (
                    <>
                      <strong style={{ color: 'var(--success)' }}>✓ Correct!</strong>
                      <div style={{ marginTop: 4 }}>You earned <strong style={{ color: 'var(--primary)' }}>+{result.pointsAwarded}</strong> points</div>
                      {activeQuestion.explanation && (
                        <div style={{ marginTop: 8, fontSize: 14, color: 'var(--text-dim)' }}>{activeQuestion.explanation}</div>
                      )}
                    </>
                  ) : (
                    <>
                      <strong style={{ color: 'var(--danger)' }}>✗ Not quite</strong>
                      <div style={{ marginTop: 4 }}>Better luck on the next one!</div>
                    </>
                  )}
                </div>
              )}

              {closed && !submitted && (
                <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: 'var(--bg-2)', textAlign: 'center', color: 'var(--text-dim)' }}>
                  ⏱️ Time's up. Waiting for the next question…
                </div>
              )}
            </div>
          </>
        )}

        <div className="card">
          <h3 style={{ marginTop: 0 }}>🏆 Leaderboard</h3>
          {leaderboard.length === 0 ? (
            <div className="empty-state">No scores yet.</div>
          ) : (
            leaderboard.map((row, i) => (
              <div key={row.userId} className="leaderboard-row">
                <div className="leaderboard-rank">{i + 1}</div>
                <div style={{ flex: 1 }}>{row.name}</div>
                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{row.points} pts</div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
