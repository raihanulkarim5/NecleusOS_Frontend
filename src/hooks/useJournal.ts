import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { journalService } from '../services';
import type { JournalDraft } from '../types/journal';

export function useJournalEntries() {
  return useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => journalService.getEntries(),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['journal-streak'] });
    },
  });
}
