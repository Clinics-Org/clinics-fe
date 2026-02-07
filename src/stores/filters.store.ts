import { create } from 'zustand';

interface FiltersState {
  patientSearch: string;
  setPatientSearch: (value: string) => void;
  visitStatus: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ALL';
  setVisitStatus: (value: FiltersState['visitStatus']) => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
  patientSearch: '',
  setPatientSearch: (value) => set({ patientSearch: value }),
  visitStatus: 'WAITING',
  setVisitStatus: (value) => set({ visitStatus: value }),
}));
