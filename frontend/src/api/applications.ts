import { api } from './axios';
import { Application, ApplicationCreate } from '../types/application';

export const applicationsApi = {
  createApplication: async (data: ApplicationCreate): Promise<Application> => {
    const response = await api.post('/applications', data);
    return response.data;
  },

  getGigApplications: async (gigId: string): Promise<Application[]> => {
    const response = await api.get(`/applications/gig/${gigId}`);
    return response.data;
  },

  updateApplicationStatus: async (applicationId: string, status: string): Promise<Application> => {
    const response = await api.put(`/applications/${applicationId}/status?status=${status}`);
    return response.data;
  },
};
