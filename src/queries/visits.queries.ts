import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { visitService } from '../api/visits.api';
import type { Visit } from '../types';
import { queryKeys } from './queryKeys';

export function useVisit(id: string) {
  return useQuery({
    queryKey: queryKeys.visit(id),
    queryFn: () => visitService.getById(id),
    enabled: Boolean(id),
  });
}

export function useVisitsByPatient(patientId: string, limit = 50) {
  return useQuery({
    queryKey: queryKeys.visitsByPatient(patientId),
    queryFn: () => visitService.getByPatientId(patientId, limit),
    enabled: Boolean(patientId),
  });
}

export function fetchVisitsByPatient(
  queryClient: QueryClient,
  patientId: string,
  limit = 50,
) {
  return queryClient.fetchQuery({
    queryKey: queryKeys.visitsByPatient(patientId),
    queryFn: () => visitService.getByPatientId(patientId, limit),
  });
}

export function useWaitingVisits() {
  return useQuery({
    queryKey: [...queryKeys.visits, 'waiting'],
    queryFn: () => visitService.getWaitingVisits(),
  });
}

export function useVisitsList(params?: {
  page?: number;
  pageSize?: number;
  date?: string;
  visitStatus?: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  doctorId?: string;
}) {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  const date = params?.date;
  const visitStatus = params?.visitStatus;
  const doctorId = params?.doctorId;

  return useQuery({
    queryKey: [
      ...queryKeys.visits,
      page,
      pageSize,
      date,
      visitStatus,
      doctorId,
    ],
    queryFn: () =>
      visitService.getAllVisits(page, pageSize, date, visitStatus, doctorId),
  });
}

export function useCreateVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      patientId: string;
      visitReason?: string;
      status?: 'waiting' | 'in_progress' | 'completed';
      doctorId?: string;
    }) => visitService.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visits });
      if (created?.patientId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.visitsByPatient(created.patientId),
        });
      }
    },
  });
}

export function useUpdateVisitStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; status: Visit['status'] }) =>
      visitService.updateStatus(data.id, data.status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visits });
      if (updated?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.visit(updated.id),
        });
      }
      if (updated?.patientId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.visitsByPatient(updated.patientId),
        });
      }
    },
  });
}

export function useUpdateVisitNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; notes: string }) =>
      visitService.updateNotes(data.id, data.notes),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visits });
      if (updated?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.visit(updated.id),
        });
      }
      if (updated?.patientId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.visitsByPatient(updated.patientId),
        });
      }
    },
  });
}

export function useUpdateVisitPrescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; prescription: Visit['prescription'] }) =>
      visitService.updatePrescription(data.id, data.prescription),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visits });
      if (updated?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.visit(updated.id),
        });
      }
      if (updated?.patientId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.visitsByPatient(updated.patientId),
        });
      }
    },
  });
}

export function useCompleteVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => visitService.complete(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visits });
      if (updated?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.visit(updated.id),
        });
      }
      if (updated?.patientId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.visitsByPatient(updated.patientId),
        });
      }
    },
  });
}
