// Entries covers the general-purpose, free-form record types. Task and
// Journal have distinct enough shapes (checklists/due dates vs. mood/
// gratitude) that they're their own modules with their own types —
// see src/types/task.ts and src/types/journal.ts (added when those
// modules are built). Everything still connects via shared Links (below).
import type { LinkRef } from './link';

// Entries covers the general-purpose, free-form record types. Task and
// Journal have distinct enough shapes (checklists/due dates vs. mood/
// gratitude) that they're their own modules with their own types —
// see src/types/task.ts and src/types/journal.ts (added when those
// modules are built). Everything still connects via shared Links (below).
export type EntryType =
  | 'Note'
  | 'Idea'
  | 'Problem'
  | 'Solution'
  | 'Reminder'
  | 'Reference'
  | 'Decision'
  | 'Meeting Note';

export type EntryStatus = 'Open' | 'In Progress' | 'Done' | 'Archived';
export type EntryPriority = 'Low' | 'Medium' | 'High';

export interface Entry {
  id: string;
  title: string;
  description: string;
  type: EntryType;
  status: EntryStatus;
  priority: EntryPriority;
  tags: string[];
  dueDate: string | null;
  links: LinkRef[];
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
}

export interface EntryDraft {
  title: string;
  description: string;
  type: EntryType;
  priority: EntryPriority;
  tags: string[];
  dueDate: string | null;
}
