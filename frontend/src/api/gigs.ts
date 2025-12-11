import { api } from './axios';
import { Gig, GigCreate, GigUpdate, GigClose, GigHold } from '../types';

export const gigsApi = {
  createGig: async (data: GigCreate): Promise<Gig> => {
    const response = await api.post('/gigs', data);
    return response.data;
  },

  getProfessorGigs: async (professorId: string): Promise<Gig[]> => {
    const response = await api.get(`/gigs/professor/${professorId}`);
    return response.data;
  },

  getGig: async (gigId: string): Promise<Gig> => {
    const response = await api.get(`/gigs/${gigId}`);
    return response.data;
  },

  updateGig: async (gigId: string, data: GigUpdate): Promise<Gig> => {
    const response = await api.put(`/gigs/${gigId}`, data);
    return response.data;
  },

  closeGig: async (gigId: string, data: GigClose): Promise<Gig> => {
    const response = await api.put(`/gigs/${gigId}/close`, data);
    return response.data;
  },

  holdGig: async (gigId: string, data: GigHold): Promise<Gig> => {
    const response = await api.put(`/gigs/${gigId}/hold`, data);
    return response.data;
  },

  activateGig: async (gigId: string): Promise<Gig> => {
    const response = await api.put(`/gigs/${gigId}/activate`, {});
    return response.data;
  },

  deleteGig: async (gigId: string): Promise<void> => {
    await api.delete(`/gigs/${gigId}`);
  },
};
