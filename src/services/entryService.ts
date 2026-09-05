import type { Entry, EntryDraft, EntryUpdate } from '../types/entry';

export interface EntryService {
  getEntries(): Promise<Entry[]>;
  getEntry(id: string): Promise<Entry>;
  createEntry(draft: EntryDraft): Promise<Entry>;
  updateEntry(id: string, updates: EntryUpdate): Promise<Entry>;
  deleteEntry(id: string): Promise<void>;
}
