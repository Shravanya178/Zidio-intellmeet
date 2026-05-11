import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../types/user';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      setAuth: (user, accessToken) => set({ user, accessToken }),

      clearAuth: () => set({ user: null, accessToken: null }),

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'intellmeet-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);