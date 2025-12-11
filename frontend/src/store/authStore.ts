import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  userId: string | null;
  userType: 'professor' | 'student' | null;
  isAuthenticated: boolean;
  setAuth: (token: string, userId: string, userType: 'professor' | 'student') => void;
  logout: () => void;
  // Legacy support
  professorId: string | null;
  studentId: string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      userType: null,
      professorId: null,
      studentId: null,
      isAuthenticated: false,

      setAuth: (token: string, userId: string, userType: 'professor' | 'student') => {
        set({ 
          token, 
          userId, 
          userType,
          professorId: userType === 'professor' ? userId : null,
          studentId: userType === 'student' ? userId : null,
          isAuthenticated: true 
        });
      },

      logout: () => {
        set({ 
          token: null, 
          userId: null, 
          userType: null,
          professorId: null,
          studentId: null,
          isAuthenticated: false 
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
