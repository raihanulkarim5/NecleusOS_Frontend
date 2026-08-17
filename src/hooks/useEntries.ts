import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { entryService } from '../services';
import type { Entry, EntryDraft } from '../types/entry';

export function useEntries() {
  return useQuery({
    queryKey: ['entries'],
    queryFn: () => entryService.getEntries(),
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: EntryDraft) => entryService.createEntry(draft),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entries'] }),
  });
}

export function useUpdateEntryStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Entry['status'] }) =>
      entryService.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entries'] }),
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => entryService.toggleFavorite(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entries'] }),
  });
}
