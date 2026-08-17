import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services';
import type { AuthProvider, LoginCredentials, RegisterDetails } from '../types/auth';

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: () => authService.getSession(),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (session) => queryClient.setQueryData(['session'], session),
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (details: RegisterDetails) => authService.register(details),
    onSuccess: (session) => queryClient.setQueryData(['session'], session),
  });
}

export function useSocialLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (provider: AuthProvider) => authService.loginWithProvider(provider),
    onSuccess: (session) => queryClient.setQueryData(['session'], session),
  });
}

export function useSocialRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (provider: AuthProvider) => authService.registerWithProvider(provider),
    onSuccess: (session) => queryClient.setQueryData(['session'], session),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => queryClient.setQueryData(['session'], null),
  });
}
