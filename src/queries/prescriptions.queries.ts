import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { prescriptionService } from '../api/prescriptions.api';
import { visitService } from '../api/visits.api';
import type { Prescription, Visit } from '../types';
import { queryKeys } from './queryKeys';

export function usePrescription(prescriptionId: string) {
  return useQuery({
    queryKey: queryKeys.prescriptions(prescriptionId),
    queryFn: () => prescriptionService.getById(prescriptionId),
    enabled: Boolean(prescriptionId),
  });
}

export function usePrescriptionsByIds(prescriptionIds: string[]) {
  return useQueries({
    queries: prescriptionIds.map((id) => ({
      queryKey: queryKeys.prescriptions(id),
      queryFn: () => prescriptionService.getById(id),
      enabled: Boolean(id),
    })),
  });
}

export function useCreatePrescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { visitId: string; prescription: Prescription }) =>
      prescriptionService.create(data.visitId, data.prescription),
    onSuccess: (_createdId, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.visit(variables.visitId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.visits });
    },
  });
}

export function useUpdatePrescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      prescriptionId: string;
      prescription: Prescription;
    }) => prescriptionService.update(data.prescriptionId, data.prescription),
    onSuccess: (_updatedId, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.prescriptions(variables.prescriptionId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.visits });
    },
  });
}

export function useSavePrescription(visitId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (prescription: Prescription) => {
      if (!visitId) {
        throw new Error('Visit ID is required');
      }

      let visit =
        queryClient.getQueryData<Visit | null>(queryKeys.visit(visitId)) ||
        null;
      if (!visit) {
        visit = await visitService.getById(visitId);
      }
      if (!visit) {
        throw new Error('Visit not found');
      }

      if (visit.prescription_id) {
        await prescriptionService.update(visit.prescription_id, prescription);
        return { prescriptionId: visit.prescription_id, action: 'update' };
      }

      const createdId = await prescriptionService.create(visitId, prescription);
      return { prescriptionId: createdId, action: 'create' };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visits });
      queryClient.invalidateQueries({ queryKey: queryKeys.visit(visitId) });
      if (result?.prescriptionId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.prescriptions(result.prescriptionId),
        });
      }
    },
  });
}
