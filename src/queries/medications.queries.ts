import { useQuery } from '@tanstack/react-query';
import { medicationService } from '../api/medications.api';
import { queryKeys } from './queryKeys';

export function useMedicationSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.medications(query),
    queryFn: () => medicationService.search(query),
    enabled: query.trim().length >= 2,
  });
}
