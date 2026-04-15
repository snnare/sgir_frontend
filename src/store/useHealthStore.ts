import { create } from 'zustand';
import { getHealthStatus } from '../api/healthService';

interface HealthState {
  status: 'online' | 'offline' | 'loading' | 'idle';
  data: any | null;
  checkConnection: () => Promise<void>;
}

export const useHealthStore = create<HealthState>((set) => ({
  status: 'idle',
  data: null,
  checkConnection: async () => {
    set({ status: 'loading' });
    try {
      const data = await getHealthStatus();
      set({ data, status: 'online' });
    } catch (error) {
      set({ status: 'offline', data: null });
    }
  },
}));