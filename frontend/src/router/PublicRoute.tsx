import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const PublicRoute = () => {
  const token = useAuthStore((state) => state.accessToken);

  // Si l'utilisateur a un token, on le redirige vers le dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  // Sinon, on affiche la page demandée (Login/Register)
  return <Outlet />;
};