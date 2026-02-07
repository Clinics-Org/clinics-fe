import { useMutation, useQuery } from '@tanstack/react-query';
import { authService } from '../api/auth.api';
import { queryKeys } from './queryKeys';

export function useLogin() {
  return useMutation({
    mutationFn: authService.login,
  });
}

export function useIsAuthenticated() {
  return useQuery({
    queryKey: [...queryKeys.auth, 'isAuthenticated'],
    queryFn: () => authService.isAuthenticated(),
  });
}
