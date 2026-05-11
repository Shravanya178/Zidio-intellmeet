import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/auth.service';

export const useLogout = () => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout API failed", error);
    } finally {
      clearAuth();
      
      queryClient.clear();
      
      navigate('/login', { replace: true });
    }
  };

  return logout;
};