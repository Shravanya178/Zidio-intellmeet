import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/auth/LoginPage'
import ProtectedRoute from './ProtectedRoute'
import RegisterPage from '../pages/auth/RegisterPage'
import AppLayout from './AppLayout'
import AuthLayout from './AuthLayout'
import ForgotPasswordPage from '../pages/auth/ForgotPassword'
import DashboardLayout from './DashboardLayout'
import DashboardHome from '../pages/dashboard/DashboardHome'
import TeamsPage from '../pages/dashboard/TeamsPage'

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path='/forgot-password' element={<ForgotPasswordPage />} />
        </Route>

        <Route element={<DashboardLayout/>}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/teams" element={<TeamsPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>

          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}