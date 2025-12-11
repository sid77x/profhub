import { api } from './axios';
import { Professor } from '../types';

export const professorApi = {
  getProfile: async (professorId: number): Promise<Professor> => {
    const response = await api.get(`/professors/${professorId}`);
    return response.data;
  },

  updateProfile: async (professorId: number, data: Partial<Professor>): Promise<Professor> => {
    const response = await api.put(`/professors/${professorId}`, data);
    return response.data;
  },

  createProfile: async (data: Omit<Professor, 'id'>): Promise<Professor> => {
    const response = await api.post('/professors', data);
    return response.data;
  },

  listProfessors: async (): Promise<Professor[]> => {
    const response = await api.get('/professors');
    return response.data;
  },
};
