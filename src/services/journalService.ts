import type { JournalDraft, JournalEntry, JournalUpdate } from '../types/journal';

export interface JournalService {
  getEntries(): Promise<JournalEntry[]>;
  getEntry(id: string): Promise<JournalEntry>;
  createEntry(draft: JournalDraft): Promise<JournalEntry>;
  updateEntry(id: string, updates: JournalUpdate): Promise<JournalEntry>;
  deleteEntry(id: string): Promise<void>;
  moveEntry(id: string, direction: 'up' | 'down'): Promise<JournalEntry[]>;
  getStreakDays(): Promise<number>;
}
