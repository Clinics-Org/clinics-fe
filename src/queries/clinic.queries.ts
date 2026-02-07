import { useQuery } from '@tanstack/react-query';
import { clinicService } from '../api/clinic.api';
import { queryKeys } from './queryKeys';

export function useCurrentClinic() {
  return useQuery({
    queryKey: queryKeys.clinic,
    queryFn: () => clinicService.getCurrentClinic(),
  });
}

export function useClinicStats(dateRange?: { start: string; end: string }) {
  return useQuery({
    queryKey: [...queryKeys.clinic, 'stats', dateRange?.start, dateRange?.end],
    queryFn: () => clinicService.getStats(undefined, dateRange),
  });
}
