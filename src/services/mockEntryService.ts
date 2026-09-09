import type { EntryService } from './entryService';
import type { Entry, EntryDraft, EntryUpdate } from '../types/entry';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const today = () => new Date().toISOString().slice(0, 10);

let entries: Entry[] = [
  {
    id: 'ent-1',
    title: 'Kanban board for Tasks',
    type: 'Note',
    description: '<p>Added Kanban view with Open → In Progress → Done → Archived columns, drag-and-drop support planned for a later pass.</p>',
    tags: ['frontend', 'ui'],
    favorite: true,
    links: [],
    order: 0,
    createdAt: '2026-08-15',
    updatedAt: today(),
  },
  {
    id: 'ent-2',
    title: 'Finance module database shape',
    type: 'Decision',
    description: '<p>Bank accounts, encrypted credentials, expenses, budgets, debt tracking with person info. Went with a mock-first service layer so the .NET API can slot in later without touching components.</p>',
    tags: ['backend', 'design'],
    favorite: false,
    links: [],
    order: 1,
    createdAt: '2026-08-12',
    updatedAt: today(),
  },
  {
    id: 'ent-3',
    title: 'Modal stacking context bug',
    type: 'Problem/Solution',
    description: '<p><strong>Problem:</strong> modals were trapped below the navbar because <code>.shell-content</code> creates a stacking context.</p><p><strong>Solution:</strong> render modals via <code>createPortal</code> to <code>document.body</code> instead of inline.</p>',
    tags: ['bug', 'css'],
    favorite: false,
    links: [],
    order: 2,
    createdAt: '2026-08-10',
    updatedAt: '2026-08-11',
  },
  {
    id: 'ent-4',
    title: 'Frontend architecture review',
    type: 'Meeting Note',
    description: '<p>Discussed state management, TanStack Query patterns, component organization. Agreed on <code>setQueryData</code> for mutations instead of blanket refetching.</p>',
    tags: ['meeting', 'architecture'],
    favorite: false,
    links: [],
    order: 3,
    createdAt: '2026-08-16',
    updatedAt: '2026-08-16',
  },
  {
    id: 'ent-5',
    title: 'Cross-module link picker',
    type: 'Idea',
    description: '<p>Build a reusable modal for creating links between any two entities. Needed across Tasks, Journal, Entries, Finance, etc.</p>',
    tags: ['feature', 'ui'],
    favorite: false,
    links: [],
    order: 4,
    createdAt: '2026-08-14',
    updatedAt: '2026-08-14',
  },
  {
    id: 'ent-6',
    title: 'Review commits before pushing',
    type: 'Reminder',
    description: '<p>Always fetch <code>origin main</code>, check for conflicts, verify the build passes before <code>git push</code>.</p>',
    tags: ['ops', 'workflow'],
    favorite: false,
    links: [],
    order: 5,
    createdAt: '2026-08-08',
    updatedAt: '2026-08-08',
  },
];

export const mockEntryService: EntryService = {
  async getEntries() {
    await delay(400);
    return [...entries].sort((a, b) => a.order - b.order);
  },

  async getEntry(id: string) {
    await delay(200);
    const entry = entries.find(e => e.id === id);
    if (!entry) throw new Error('Entry not found');
    return { ...entry };
  },

  async createEntry(draft: EntryDraft) {
    await delay(400);
    const newEntry: Entry = {
      ...draft,
      id: `ent-${Date.now()}`,
      favorite: false,
      links: [],
      order: entries.length,
      createdAt: today(),
      updatedAt: today(),
    };
    entries.push(newEntry);
    return newEntry;
  },

  async updateEntry(id: string, updates: EntryUpdate) {
    await delay(300);
    const idx = entries.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Entry not found');

    const entry = entries[idx];
    const updated: Entry = {
      ...entry,
      ...updates,
      id: entry.id,
      createdAt: entry.createdAt,
      updatedAt: today(),
    };

    entries[idx] = updated;
    return { ...updated };
  },

  async deleteEntry(id: string) {
    await delay(300);
    entries = entries.filter(e => e.id !== id);
  },
};
