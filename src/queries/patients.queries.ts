import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '../api/patients.api';
import type { Patient } from '../types';
import { queryKeys } from './queryKeys';

export function usePatientSearch(query: string, limit = 20) {
  return useQuery({
    queryKey: queryKeys.patientSearch(query),
    queryFn: () => patientService.search(query, limit),
    enabled: query.trim().length >= 2,
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: queryKeys.patient(id),
    queryFn: () => patientService.getById(id),
    enabled: Boolean(id),
  });
}

export function useAllPatients() {
  return useQuery({
    queryKey: queryKeys.patients,
    queryFn: () => patientService.getAll(),
  });
}

export function useRecentPatients(limit = 10) {
  return useQuery({
    queryKey: [...queryKeys.patients, 'recent', limit],
    queryFn: () => patientService.getRecent(limit),
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Patient, 'id' | 'createdAt'>) =>
      patientService.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients });
      if (created?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.patient(created.id),
        });
      }
    },
  });
}
