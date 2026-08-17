import type { JournalService } from './journalService';
import type { JournalDraft, JournalEntry } from '../types/journal';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const today = () => new Date().toISOString().slice(0, 10);

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

let entries: JournalEntry[] = [
  {
    id: 'j1',
    date: today(),
    logType: 'Daily',
    content: 'Pushed the Task module today — checklists and recurrence turned out cleaner than expected once the shared Link type was in place.',
    wins: ['Task module shipped', 'Clean build on first try'],
    mistakes: [],
    learnings: ['Splitting Entries from Task/Journal early saved a bigger refactor later'],
    gratitude: ['Quiet focused morning'],
    mood: 4,
    tags: ['work'],
    links: [],
    createdAt: today(),
    updatedAt: today(),
  },
  {
    id: 'j2',
    date: daysAgo(1),
    logType: 'Daily',
    content: 'Merge conflict on galaxy.css took longer than expected, but nothing was lost in the end.',
    wins: ['Resolved merge without losing work'],
    mistakes: ['Should have fetched before pushing the first time'],
    learnings: ['Always fetch before push when editing the repo from two places'],
    gratitude: [],
    mood: 3,
    tags: ['work'],
    links: [],
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: 'j3',
    date: daysAgo(2),
    logType: 'Meeting',
    content: 'Reviewed the Entries vs. module-specific data model decision — went with module-specific types plus a shared Link layer.',
    wins: [],
    mistakes: [],
    learnings: ['Generic "everything is an Entry" models trade type safety for flexibility — worth it only if querying across types is the main use case'],
    gratitude: [],
    mood: 4,
    tags: ['architecture'],
    links: [],
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: 'j4',
    date: daysAgo(3),
    logType: 'Personal',
    content: 'Slower day — mostly reading and letting ideas settle before touching code again.',
    wins: [],
    mistakes: [],
    learnings: [],
    gratitude: ['A slower day to think'],
    mood: 3,
    tags: [],
    links: [],
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
];

export const mockJournalService: JournalService = {
  async getEntries(): Promise<JournalEntry[]> {
    await delay(400);
    return [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async createEntry(draft: JournalDraft): Promise<JournalEntry> {
    await delay(400);
    const now = today();
    const entry: JournalEntry = {
      id: `j${Date.now()}`,
      ...draft,
      links: [],
      createdAt: now,
      updatedAt: now,
    };
    entries = [entry, ...entries];
    return entry;
  },

  async getStreakDays(): Promise<number> {
    await delay(150);
    // Count consecutive days with an entry, starting from today.
    let streak = 0;
    let cursor = new Date();
    const dateSet = new Set(entries.map((e) => e.date));
    while (dateSet.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  },
};
