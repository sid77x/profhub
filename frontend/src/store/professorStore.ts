import { create } from 'zustand';
import { Professor } from '../types';
import { professorApi } from '../api/professor';

interface ProfessorState {
  professor: Professor | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (professorId: number) => Promise<void>;
  updateProfile: (professorId: number, data: Partial<Professor>) => Promise<void>;
  clearError: () => void;
}

export const useProfessorStore = create<ProfessorState>((set) => ({
  professor: null,
  loading: false,
  error: null,

  fetchProfile: async (professorId: number) => {
    set({ loading: true, error: null });
    try {
      const data = await professorApi.getProfile(professorId);
      set({ professor: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateProfile: async (professorId: number, data: Partial<Professor>) => {
    set({ loading: true, error: null });
    try {
      const updated = await professorApi.updateProfile(professorId, data);
      set({ professor: updated, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
