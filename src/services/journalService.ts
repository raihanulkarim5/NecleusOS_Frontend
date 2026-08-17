import type { JournalDraft, JournalEntry } from '../types/journal';

export interface JournalService {
  getEntries(): Promise<JournalEntry[]>;
  createEntry(draft: JournalDraft): Promise<JournalEntry>;
  getStreakDays(): Promise<number>;
}
