// Entries covers general-purpose, free-form records — quick captures that
// start with a title, type, tags, and an optional image, then get a
// rich-text write-up added as a second step. Task and Journal have distinct
// enough shapes (checklists/due dates vs. mood/gratitude) that they're
// their own modules with their own types — see src/types/task.ts and
// src/types/journal.ts. Everything still connects via shared Links (below).
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
  imageUrl: string | null; // data URL, mock-stored until a real upload backend exists
  favorite: boolean;
  links: LinkRef[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface EntryDraft {
  title: string;
  type: EntryType;
  description: string;
  tags: string[];
  imageUrl: string | null;
}

export interface EntryUpdate {
  title?: string;
  type?: EntryType;
  description?: string;
  tags?: string[];
  imageUrl?: string | null;
  favorite?: boolean;
  links?: LinkRef[];
}
