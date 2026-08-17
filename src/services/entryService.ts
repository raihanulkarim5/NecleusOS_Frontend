import type { Entry, EntryDraft } from '../types/entry';

export interface EntryService {
  getEntries(): Promise<Entry[]>;
  getEntry(id: string): Promise<Entry | null>;
  createEntry(draft: EntryDraft): Promise<Entry>;
  updateStatus(id: string, status: Entry['status']): Promise<Entry>;
  toggleFavorite(id: string): Promise<Entry>;
}
