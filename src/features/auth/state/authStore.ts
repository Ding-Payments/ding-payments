import { create } from 'zustand';

export interface AuthState {
  isAuthenticated: boolean;
  authenticate: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  authenticate: () => set({ isAuthenticated: true }),
  reset: () => set({ isAuthenticated: false }),
}));
