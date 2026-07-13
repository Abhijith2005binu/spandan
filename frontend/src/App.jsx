import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

import AuthPage from './pages/AuthPage'
import TeacherDashboard from './pages/TeacherDashboard'
import TeacherRoom from './pages/TeacherRoom'
import StudentDashboard from './pages/StudentDashboard'
import StudentSession from './pages/StudentSession'

function Protected({ children, role }) {
  const { user, isAuthenticated, token } = useAuthStore()
  if (!token || !isAuthenticated) return <Navigate to="/" replace />
  if (role && user?.role !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const bootstrap = useAuthStore(s => s.bootstrap)

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />

      <Route path="/teacher" element={
        <Protected role="teacher"><TeacherDashboard /></Protected>
      } />
      <Route path="/teacher/room/:roomId" element={
        <Protected role="teacher"><TeacherRoom /></Protected>
      } />

      <Route path="/student" element={
        <Protected role="student"><StudentDashboard /></Protected>
      } />
      <Route path="/student/session/:roomCode" element={
        <Protected role="student"><StudentSession /></Protected>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
