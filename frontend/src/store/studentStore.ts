import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

interface Student {
  id: string;
  name: string;
  email: string;
  reg_no: string;
  department: string;
  year: number;
  college_name?: string;
  skills?: string[];
  resume_url?: string;
  bio?: string;
}

interface StudentState {
  student: Student | null;
  loading: boolean;
  error: string | null;
  fetchStudent: (id: string) => Promise<void>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  clearStudent: () => void;
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set) => ({
      student: null,
      loading: false,
      error: null,

      fetchStudent: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.get(`${API_URL}/students/${id}`);
          set({ student: response.data, loading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.detail || 'Failed to fetch student', 
            loading: false 
          });
        }
      },

      updateStudent: async (id: string, data: Partial<Student>) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.put(`${API_URL}/students/${id}`, data);
          set({ student: response.data, loading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.detail || 'Failed to update student', 
            loading: false 
          });
          throw error;
        }
      },

      clearStudent: () => set({ student: null, error: null }),
    }),
    {
      name: 'student-storage',
      partialize: (state) => ({ student: state.student }),
    }
  )
);
