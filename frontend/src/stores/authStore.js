import { create } from 'zustand'
import { api } from '../api'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('spandan-token') || null,
  isAuthenticated: false,
  loading: false,
  error: null,

  bootstrap: async () => {
    const token = get().token
    if (!token) return
    try {
      const { user } = await api.me()
      set({ user, isAuthenticated: true })
    } catch {
      localStorage.removeItem('spandan-token')
      set({ user: null, token: null, isAuthenticated: false })
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { user, token } = await api.login({ email, password })
      localStorage.setItem('spandan-token', token)
      set({ user, token, isAuthenticated: true, loading: false })
      return user
    } catch (e) {
      set({ error: e.message, loading: false })
      throw e
    }
  },

  register: async (name, email, password, role) => {
    set({ loading: true, error: null })
    try {
      const { user, token } = await api.register({ name, email, password, role })
      localStorage.setItem('spandan-token', token)
      set({ user, token, isAuthenticated: true, loading: false })
      return user
    } catch (e) {
      set({ error: e.message, loading: false })
      throw e
    }
  },

  logout: () => {
    localStorage.removeItem('spandan-token')
    set({ user: null, token: null, isAuthenticated: false })
  }
}))
