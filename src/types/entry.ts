// Entries covers general-purpose, free-form records — quick captures that
// start as just a title + type, then get fleshed out with a rich-text
// description and tags. Task and Journal have distinct enough shapes
// (checklists/due dates vs. mood/gratitude) that they're their own modules
// with their own types — see src/types/task.ts and src/types/journal.ts.
// Everything still connects via shared Links (below).
import type { LinkRef } from './link';

export type EntryType =
  | 'Note'
  | 'Idea'
  | 'Problem/Solution'
  | 'Reminder'
  | 'Reference'
  | 'Decision'
  | 'Meeting Note';

export interface Entry {
  id: string;
  title: string;
  type: EntryType;
  description: string; // rich HTML from RichNotesEditor
  tags: string[];
  favorite: boolean;
  links: LinkRef[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Step 1 of the quick-capture flow: just enough to file something away.
export interface EntryQuickDraft {
  title: string;
  type: EntryType;
}

// Step 2 fills in the rest.
export interface EntryDraft {
  title: string;
  type: EntryType;
  description: string;
  tags: string[];
}

export interface EntryUpdate {
  title?: string;
  type?: EntryType;
  description?: string;
  tags?: string[];
  favorite?: boolean;
  links?: LinkRef[];
}
