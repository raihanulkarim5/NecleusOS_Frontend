import type { LinkRef } from './link';

export type JournalLogType = 'Daily' | 'Office' | 'Personal' | 'Meeting';

export interface JournalEntry {
  id: string;
  date: string;
  logType: JournalLogType;
  content: string;
  wins: string[];
  mistakes: string[];
  learnings: string[];
  gratitude: string[];
  mood: number; // 1 (low) – 5 (great)
  tags: string[];
  links: LinkRef[];
  createdAt: string;
  updatedAt: string;
}

export interface JournalDraft {
  date: string;
  logType: JournalLogType;
  content: string;
  wins: string[];
  mistakes: string[];
  learnings: string[];
  gratitude: string[];
  mood: number;
  tags: string[];
}
