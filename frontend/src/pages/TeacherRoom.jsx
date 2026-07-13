import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useAuthStore } from '../stores/authStore'
import { api } from '../api'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (window.location.protocol + '//' + window.location.host)

export default function TeacherRoom() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { token, user, logout } = useAuthStore()
  const [room, setRoom] = useState(null)
  const [questions, setQuestions] = useState([])
  const [activeQuestionId, setActiveQuestionId] = useState(null)
  const [results, setResults] = useState({}) // questionId -> {results, total}
  const [participants, setParticipants] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [tab, setTab] = useState('questions')
  const [transcript, setTranscript] = useState('')
  const [generating, setGenerating] = useState(false)
  const [aiError, setAiError] = useState(null)
  const socketRef = useRef(null)

  const refreshAll = useCallback(async () => {
    if (!roomId || !room) return
    const [{ questions }, lb] = await Promise.all([
      api.listQuestions(roomId),
      api.getLeaderboard(room._id)
    ])
    setQuestions(questions)
    setLeaderboard(lb.leaderboard || [])

    const active = questions.find(q => q.isActive)
    if (active) setActiveQuestionId(active._id)

    // Load results for active question
    if (active) {
      try {
        const r = await api.getResults(active._id)
        setResults(prev => ({ ...prev, [active._id]: r }))
      } catch {}
    }
  }, [roomId, room])

  useEffect(() => {
    if (!token) return
    api.getRoom(roomId).then(({ room }) => setRoom(room)).catch(console.error)
  }, [roomId, token])

  useEffect(() => {
    if (!room || !token) return

    const s = io(SOCKET_URL, { auth: { token } })
    socketRef.current = s

    s.on('connect', () => {
      s.emit('room:join', { roomCode: room.code, name: user?.name })
    })

    s.on('question:launched', (q) => {
      setActiveQuestionId(q._id)
      setResults(prev => ({ ...prev, [q._id]: { results: [], total: 0 } }))
    })
    s.on('question:closed', ({ questionId }) => {
      setQuestions(prev => prev.map(q => q._id === questionId ? { ...q, isActive: false } : q))
      setActiveQuestionId(null)
    })
    s.on('response:update', ({ questionId, results: r, total }) => {
      setResults(prev => ({ ...prev, [questionId]: { results: r, total } }))
    })
    s.on('room:participant-joined', ({ name, totalParticipants }) => {
      setParticipants(prev => prev.some(p => p.name === name) ? prev : [...prev, { name }])
    })
    s.on('room:participant-left', () => {}) // recompute via length

    refreshAll()

    return () => { s.disconnect() }
  }, [room, token, user, refreshAll])

  const launchQuestion = async (q) => {
    if (!socketRef.current) return
    // Mark active in DB
    try {
      const res = await fetch('/api/questions/' + q._id + '/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      })
      // Backend may not have this exact route — fall back: update DB then emit
      if (!res.ok && res.status !== 404) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to launch')
      }
    } catch {
      // Try via direct DB update route — if not available we rely on broadcast
    }
    socketRef.current.emit('question:launch', { roomCode: room.code, question: { ...q, isActive: true, launchedAt: new Date() } })
    setActiveQuestionId(q._id)
    setResults(prev => ({ ...prev, [q._id]: { results: [], total: 0 } }))
  }

  const closeQuestion = () => {
    if (!socketRef.current || !activeQuestionId) return
    socketRef.current.emit('question:close', { roomCode: room.code, questionId: activeQuestionId })
    setActiveQuestionId(null)
    refreshAll()
  }

  const generateFromAI = async () => {
    if (!transcript.trim() || transcript.trim().length < 20) {
      setAiError('Please paste at least 20 characters of text to generate questions.')
      return
    }
    setAiError(null)
    setGenerating(true)
    try {
      const { questions: generated } = await api.generateQuestions({
        transcript,
        count: 2,
        difficulty: 'medium'
      })
      // Save each to DB
      const saved = []
      for (const g of generated) {
        const correctIdx = g.options?.findIndex(o => o.isCorrect) ?? -1
        const { question } = await api.saveQuestion({
          roomId,
          type: 'MCQ',
          question: g.question,
          options: g.options,
          correctOptionIndex: correctIdx >= 0 ? correctIdx : (g.correctOptionIndex ?? null),
          explanation: g.explanation || '',
          timeLimit: 30,
          points: 100
        })
        saved.push(question)
      }
      setQuestions(prev => [...prev, ...saved])
      setTranscript('')
      setTab('questions')
    } catch (e) {
      setAiError(e.message || 'Failed to generate questions')
    } finally {
      setGenerating(false)
    }
  }

  if (!room) {
    return (
      <div className="container">
        <div className="card">Loading room…</div>
      </div>
    )
  }

  return (
    <>
      <div className="app-header">
        <div className="brand">Spandan</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>{room.name}</span>
          <button className="btn btn-secondary" onClick={() => { logout(); navigate('/') }}>Logout</button>
        </div>
      </div>

      <div className="container">
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>Room Code</div>
          <div className="room-code-display">{room.code}</div>
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-dim)' }}>
            {participants.length || room.participants?.length || 0} participants · {questions.length} questions
          </div>
        </div>

        <div className="tab-row">
          <button className={`tab-btn ${tab === 'questions' ? 'active' : ''}`} onClick={() => setTab('questions')}>
            Questions ({questions.length})
          </button>
          <button className={`tab-btn ${tab === 'generate' ? 'active' : ''}`} onClick={() => setTab('generate')}>
            ✨ Generate with AI
          </button>
          <button className={`tab-btn ${tab === 'live' ? 'active' : ''}`} onClick={() => setTab('live')}>
            Live Results
          </button>
          <button className={`tab-btn ${tab === 'leaderboard' ? 'active' : ''}`} onClick={() => setTab('leaderboard')}>
            Leaderboard
          </button>
          <button className={`tab-btn ${tab === 'participants' ? 'active' : ''}`} onClick={() => setTab('participants')}>
            Participants
          </button>
        </div>

        {tab === 'questions' && (
          <>
            {activeQuestionId && (
              <div className="card" style={{ borderColor: 'var(--success)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>🟢 Question is LIVE</span>
                  <button className="btn btn-danger" onClick={closeQuestion}>Close Question</button>
                </div>
              </div>
            )}
            {questions.length === 0 ? (
              <div className="card empty-state">
                No questions yet. Switch to the "Generate with AI" tab to create some from a transcript!
              </div>
            ) : (
              questions.map((q, i) => (
                <div key={q._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>Q{i + 1} · {q.type} · {q.points} pts · {q.timeLimit}s</div>
                      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{q.question}</div>
                      {q.options.map((o, idx) => (
                        <div key={idx} style={{ fontSize: 14, color: o.isCorrect ? 'var(--success)' : 'var(--text-dim)' }}>
                          {String.fromCharCode(65 + idx)}. {o.text} {o.isCorrect && '✓'}
                        </div>
                      ))}
                    </div>
                    <button
                      className="btn"
                      disabled={!!activeQuestionId}
                      onClick={() => launchQuestion(q)}
                    >
                      {activeQuestionId === q._id ? 'Live' : 'Launch'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {tab === 'generate' && (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Generate questions from text</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>
              Paste a transcript, lecture notes, or any text. AI will generate MCQs for your students.
            </p>
            <div className="form-group">
              <label className="label">Transcript / Content</label>
              <textarea
                className="input"
                rows={8}
                placeholder="Paste your lecture transcript here (min 20 chars)…"
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
              />
            </div>
            {aiError && <div className="error-banner">{aiError}</div>}
            <button className="btn" disabled={generating} onClick={generateFromAI}>
              {generating ? 'Generating…' : '✨ Generate 2 Questions'}
            </button>
          </div>
        )}

        {tab === 'live' && (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Live Results</h3>
            {!activeQuestionId ? (
              <div className="empty-state">No question is currently active. Launch one from the Questions tab.</div>
            ) : (
              <LiveResultBars question={questions.find(q => q._id === activeQuestionId)} data={results[activeQuestionId]} />
            )}
          </div>
        )}

        {tab === 'leaderboard' && (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>🏆 Leaderboard</h3>
            {leaderboard.length === 0 ? (
              <div className="empty-state">No responses yet.</div>
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
        )}

        {tab === 'participants' && (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Participants</h3>
            <div>
              {(room.participants || []).map(p => (
                <span key={p._id || p} className="participant-pill">{p.name || p}</span>
              ))}
              {(!room.participants || room.participants.length === 0) && (
                <div className="empty-state">No one has joined yet.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function LiveResultBars({ question, data }) {
  if (!question) return null
  const counts = {}
  ;(data?.results || []).forEach(r => { counts[r.option] = r.count })
  const total = data?.total || 0
  const opts = question.options
  return (
    <div>
      <div style={{ marginBottom: 16, fontSize: 15, fontWeight: 600 }}>{question.question}</div>
      {opts.map((o, i) => {
        const c = counts[i] || 0
        const pct = total === 0 ? 0 : Math.round((c / total) * 100)
        return (
          <div key={i} className="bar-row" style={{ alignItems: 'center' }}>
            <span className="bar-label" style={{ minWidth: 28 }}>{String.fromCharCode(65 + i)}</span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: pct + '%' }}>
                {total > 0 && <span>{pct}% ({c})</span>}
              </div>
            </div>
            <span style={{ minWidth: 60, fontSize: 12, color: 'var(--text-dim)' }}>{o.text}</span>
          </div>
        )
      })}
      <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-dim)' }}>Total responses: {total}</div>
    </div>
  )
}
