import { VISIT_STATUS } from '@/constants/api';
import { create } from 'zustand';

interface FiltersState {
  patientSearch: string;
  setPatientSearch: (value: string) => void;
  visitStatus: keyof typeof VISIT_STATUS | 'ALL';
  setVisitStatus: (value: FiltersState['visitStatus']) => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
  patientSearch: '',
  setPatientSearch: (value) => set({ patientSearch: value }),
  visitStatus: 'WAITING',
  setVisitStatus: (value) => set({ visitStatus: value }),
}));
