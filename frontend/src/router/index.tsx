import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/auth/LoginPage'
import ProtectedRoute from './ProtectedRoute'
import RegisterPage from '../pages/auth/RegisterPage'
import AuthLayout from './AuthLayout'
import ForgotPasswordPage from '../pages/auth/ForgotPassword'
import DashboardLayout from './DashboardLayout'
import DashboardHome from '../pages/dashboard/DashboardHome'
import TeamsPage from '../pages/dashboard/TeamsPage'
import MeetingsPage from '../pages/dashboard/MeetingsPage'
import AnalyticsPage from '../pages/dashboard/AnalyticsPage'
import MeetingRoomPage from '../pages/meeting/MeetingRoomPage'
import JoinMeetingPage from '../pages/meeting/JoinMeetingPage'
import GoogleSuccessPage from '../pages/auth/GoogleSuccess'
import TasksPage from '../pages/dashboard/TasksPage'
import { PublicRoute } from './PublicRoute'

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public join page — no login required to VIEW */}
        <Route path="/join/:roomId" element={<JoinMeetingPage />} />

        {/* Google OAuth success handler */}
        <Route path="/auth/google/success" element={<GoogleSuccessPage />} />

        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          {/* Meeting room — full screen, no dashboard layout */}
          <Route path="/meeting/:roomId" element={<MeetingRoomPage />} />

          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/meetings" element={<MeetingsPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
