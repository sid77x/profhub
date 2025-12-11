import { create } from 'zustand';
import { Gig, GigCreate, GigUpdate, GigClose, GigHold } from '../types';
import { gigsApi } from '../api/gigs';

interface GigsState {
  gigs: Gig[];
  currentGig: Gig | null;
  loading: boolean;
  error: string | null;
  fetchGigs: (professorId: string) => Promise<void>;
  fetchGig: (gigId: string) => Promise<void>;
  createGig: (data: GigCreate) => Promise<void>;
  updateGig: (gigId: string, data: GigUpdate) => Promise<void>;
  closeGig: (gigId: string, data: GigClose) => Promise<void>;
  holdGig: (gigId: string, data: GigHold) => Promise<void>;
  activateGig: (gigId: string) => Promise<void>;
  deleteGig: (gigId: string) => Promise<void>;
  clearError: () => void;
}

export const useGigsStore = create<GigsState>((set, get) => ({
  gigs: [],
  currentGig: null,
  loading: false,
  error: null,

  fetchGigs: async (professorId: string) => {
    set({ loading: true, error: null });
    try {
      const data = await gigsApi.getProfessorGigs(professorId);
      set({ gigs: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchGig: async (gigId: string) => {
    set({ loading: true, error: null });
    try {
      const data = await gigsApi.getGig(gigId);
      set({ currentGig: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createGig: async (data: GigCreate) => {
    set({ loading: true, error: null });
    try {
      const newGig = await gigsApi.createGig(data);
      set((state) => ({
        gigs: [...state.gigs, newGig],
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateGig: async (gigId: string, data: GigUpdate) => {
    set({ loading: true, error: null });
    try {
      const updated = await gigsApi.updateGig(gigId, data);
      set((state) => ({
        gigs: state.gigs.map((g) => (g.id === gigId ? updated : g)),
        currentGig: state.currentGig?.id === gigId ? updated : state.currentGig,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  closeGig: async (gigId: string, data: GigClose) => {
    set({ loading: true, error: null });
    try {
      const updated = await gigsApi.closeGig(gigId, data);
      set((state) => ({
        gigs: state.gigs.map((g) => (g.id === gigId ? updated : g)),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  holdGig: async (gigId: string, data: GigHold) => {
    set({ loading: true, error: null });
    try {
      const updated = await gigsApi.holdGig(gigId, data);
      set((state) => ({
        gigs: state.gigs.map((g) => (g.id === gigId ? updated : g)),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  activateGig: async (gigId: string) => {
    set({ loading: true, error: null });
    try {
      const updated = await gigsApi.activateGig(gigId);
      set((state) => ({
        gigs: state.gigs.map((g) => (g.id === gigId ? updated : g)),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteGig: async (gigId: string) => {
    set({ loading: true, error: null });
    try {
      await gigsApi.deleteGig(gigId);
      set((state) => ({
        gigs: state.gigs.filter((g) => g.id !== gigId),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
