import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { journalService } from '../services';
import type { JournalDraft, JournalEntry, JournalUpdate } from '../types/journal';

export function useJournalEntries() {
  return useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => journalService.getEntries(),
  });
}

export function useJournalEntry(id: string) {
  return useQuery({
    queryKey: ['journal-entry', id],
    queryFn: () => journalService.getEntry(id),
  });
}

export function useJournalStreak() {
  return useQuery({
    queryKey: ['journal-streak'],
    queryFn: () => journalService.getStreakDays(),
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: JournalDraft) => journalService.createEntry(draft),
    onSuccess: (newEntry: JournalEntry) => {
      // Update entries list in-place
      queryClient.setQueryData(
        ['journal-entries'],
        (old: JournalEntry[] | undefined) => (old ? [newEntry, ...old] : [newEntry]),
      );
      // Invalidate streak to recalculate
      queryClient.invalidateQueries({ queryKey: ['journal-streak'] });
    },
  });
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: JournalUpdate }) =>
      journalService.updateEntry(id, updates),
    onSuccess: (updated: JournalEntry) => {
      // Update specific entry
      queryClient.setQueryData(['journal-entry', updated.id], updated);
      // Update entries list
      queryClient.setQueryData(
        ['journal-entries'],
        (old: JournalEntry[] | undefined) =>
          old ? old.map((e) => (e.id === updated.id ? updated : e)) : [updated],
      );
    },
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => journalService.deleteEntry(id),
    onSuccess: (_, id: string) => {
      // Remove from entries list
      queryClient.setQueryData(
        ['journal-entries'],
        (old: JournalEntry[] | undefined) => (old ? old.filter((e) => e.id !== id) : []),
      );
      // Remove specific entry cache
      queryClient.removeQueries({ queryKey: ['journal-entry', id] });
      // Invalidate streak
      queryClient.invalidateQueries({ queryKey: ['journal-streak'] });
    },
  });
}

export function useMoveJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: 'up' | 'down' }) =>
      journalService.moveEntry(id, direction),
    onSuccess: (reordered: JournalEntry[]) => {
      // Update entire list with new order
      queryClient.setQueryData(['journal-entries'], reordered);
    },
  });
}
