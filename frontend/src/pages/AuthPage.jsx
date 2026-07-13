import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function AuthPage() {
  const navigate = useNavigate()
  const { login, register, loading, error } = useAuthStore()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
  const [localErr, setLocalErr] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLocalErr(null)
    try {
      let user
      if (mode === 'login') {
        user = await login(form.email, form.password)
      } else {
        user = await register(form.name, form.email, form.password, form.role)
      }
      navigate(user.role === 'teacher' ? '/teacher' : '/student')
    } catch (e) {
      // Error is in store; also surface locally
      setLocalErr(e.message)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Spandan</h1>
        <p className="auth-subtitle">
          {mode === 'login' ? 'Sign in to start or join a session' : 'Create your account'}
        </p>

        {(error || localErr) && (
          <div className="error-banner">{error || localErr}</div>
        )}

        <form onSubmit={onSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="label">Name</label>
              <input
                className="input"
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}

          <div className="form-group">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label className="label">I am a…</label>
              <div className="role-toggle">
                <button
                  type="button"
                  className={form.role === 'student' ? 'active' : ''}
                  onClick={() => setForm({ ...form, role: 'student' })}
                >
                  🎓 Student
                </button>
                <button
                  type="button"
                  className={form.role === 'teacher' ? 'active' : ''}
                  onClick={() => setForm({ ...form, role: 'teacher' })}
                >
                  👨‍🏫 Teacher
                </button>
              </div>
            </div>
          )}

          <button className="btn btn-block" disabled={loading} type="submit">
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: 16, textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <a onClick={() => setMode('register')} style={{ cursor: 'pointer' }}>Sign up</a>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <a onClick={() => setMode('login')} style={{ cursor: 'pointer' }}>Sign in</a>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
