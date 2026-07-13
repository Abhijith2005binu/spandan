const BASE = '/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('spandan-token')
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(BASE + path, { ...options, headers })
  let data = null
  try { data = await res.json() } catch {}

  if (!res.ok) {
    const message = (data && (data.error || data.message)) || `HTTP ${res.status}`
    const err = new Error(message)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),

  createRoom: (name) => request('/rooms', { method: 'POST', body: JSON.stringify({ name }) }),
  myRooms: () => request('/rooms/mine'),
  getRoom: (idOrCode) => request('/rooms/' + idOrCode),
  joinRoom: (code) => request('/rooms/join', { method: 'POST', body: JSON.stringify({ code }) }),
  endRoom: (id) => request(`/rooms/${id}/end`, { method: 'POST' }),

  generateQuestions: (body) => request('/questions/generate', { method: 'POST', body: JSON.stringify(body) }),
  saveQuestion: (body) => request('/questions', { method: 'POST', body: JSON.stringify(body) }),
  listQuestions: (roomId) => request('/questions?roomId=' + roomId),

  submitResponse: (body) => request('/responses', { method: 'POST', body: JSON.stringify(body) }),
  getResults: (questionId) => request(`/responses/results/${questionId}`),
  getLeaderboard: (roomId) => request(`/responses/leaderboard/${roomId}`)
}
