import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute() {
  // Pour l'instant on simule : pas de token = non connecté
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}