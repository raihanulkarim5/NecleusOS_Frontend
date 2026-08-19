import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inboxService } from '../services';

export function useInboxItems() {
  return useQuery({ queryKey: ['inbox-items'], queryFn: () => inboxService.getItems() });
}

export function useAddInboxItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => inboxService.addItem(content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inbox-items'] }),
  });
}

export function useRemoveInboxItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inboxService.removeItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inbox-items'] }),
  });
}
