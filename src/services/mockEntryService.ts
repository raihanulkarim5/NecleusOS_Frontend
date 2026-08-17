import type { EntryService } from './entryService';
import type { Entry, EntryDraft } from '../types/entry';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let entries: Entry[] = [
  {
    id: 'e3',
    title: 'Should Entries be the base type for Tasks too?',
    description: 'Decision: no — Task and Journal get their own types; Entries stays general-purpose, connected via shared Links.',
    type: 'Decision',
    status: 'Done',
    priority: 'Medium',
    tags: ['architecture'],
    dueDate: null,
    links: [],
    createdAt: '2026-08-14',
    updatedAt: '2026-08-17',
    favorite: false,
  },
  {
    id: 'e4',
    title: 'Personal OS',
    description: 'SaaS personal productivity platform — React frontend, .NET Core API, SQL Server.',
    type: 'Note',
    status: 'Open',
    priority: 'High',
    tags: ['project'],
    dueDate: null,
    links: [],
    createdAt: '2026-07-20',
    updatedAt: '2026-08-16',
    favorite: true,
  },
  {
    id: 'e5',
    title: 'Bootstrap-only styling might clash with the galaxy theme',
    description: 'Problem: heavy custom CSS is needed for the glow/gradient look, which departs from the Bootstrap-only preference.',
    type: 'Problem',
    status: 'Open',
    priority: 'Low',
    tags: ['design'],
    dueDate: null,
    links: [],
    createdAt: '2026-08-15',
    updatedAt: '2026-08-15',
    favorite: false,
  },
  {
    id: 'e6',
    title: 'Renew GitHub token before it expires',
    description: '',
    type: 'Reminder',
    status: 'Open',
    priority: 'Medium',
    tags: ['ops'],
    dueDate: '2026-08-24',
    links: [],
    createdAt: '2026-08-17',
    updatedAt: '2026-08-17',
    favorite: false,
  },
];

export const mockEntryService: EntryService = {
  async getEntries(): Promise<Entry[]> {
    await delay(400);
    return [...entries].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  },

  async getEntry(id: string): Promise<Entry | null> {
    await delay(250);
    return entries.find((e) => e.id === id) ?? null;
  },

  async createEntry(draft: EntryDraft): Promise<Entry> {
    await delay(400);
    const now = new Date().toISOString().slice(0, 10);
    const entry: Entry = {
      id: `e${Date.now()}`,
      ...draft,
      status: 'Open',
      links: [],
      createdAt: now,
      updatedAt: now,
      favorite: false,
    };
    entries = [entry, ...entries];
    return entry;
  },

  async updateStatus(id: string, status: Entry['status']): Promise<Entry> {
    await delay(300);
    entries = entries.map((e) =>
      e.id === id ? { ...e, status, updatedAt: new Date().toISOString().slice(0, 10) } : e,
    );
    const updated = entries.find((e) => e.id === id);
    if (!updated) throw new Error('Entry not found');
    return updated;
  },

  async toggleFavorite(id: string): Promise<Entry> {
    await delay(200);
    entries = entries.map((e) => (e.id === id ? { ...e, favorite: !e.favorite } : e));
    const updated = entries.find((e) => e.id === id);
    if (!updated) throw new Error('Entry not found');
    return updated;
  },
};
