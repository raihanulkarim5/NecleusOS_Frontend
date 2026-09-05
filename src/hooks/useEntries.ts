import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { entryService } from '../services';
import type { Entry, EntryDraft, EntryUpdate } from '../types/entry';

export function useEntries() {
  return useQuery({
    queryKey: ['entries'],
    queryFn: () => entryService.getEntries(),
  });
}

export function useEntry(id: string) {
  return useQuery({
    queryKey: ['entry', id],
    queryFn: () => entryService.getEntry(id),
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: EntryDraft) => entryService.createEntry(draft),
    onSuccess: (newEntry: Entry) => {
      queryClient.setQueryData(['entries'], (old: Entry[] | undefined) => (old ? [newEntry, ...old] : [newEntry]));
    },
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: EntryUpdate }) => entryService.updateEntry(id, updates),
    onSuccess: (updated: Entry) => {
      queryClient.setQueryData(['entry', updated.id], updated);
      queryClient.setQueryData(
        ['entries'],
        (old: Entry[] | undefined) => (old ? old.map(e => (e.id === updated.id ? updated : e)) : [updated]),
      );
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => entryService.deleteEntry(id),
    onSuccess: (_, id: string) => {
      queryClient.setQueryData(
        ['entries'],
        (old: Entry[] | undefined) => (old ? old.filter(e => e.id !== id) : []),
      );
      queryClient.removeQueries({ queryKey: ['entry', id] });
    },
  });
}
