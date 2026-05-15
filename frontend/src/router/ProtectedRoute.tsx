import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export default function ProtectedRoute() {
  const token = useAuthStore((s) => s.accessToken)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  // After login, redirect to the originally intended page (e.g. a meeting room from WhatsApp link)
  const redirect = sessionStorage.getItem('redirectAfterLogin')
  if (redirect) {
    sessionStorage.removeItem('redirectAfterLogin')
    return <Navigate to={redirect} replace />
  }

  return <Outlet />
}
