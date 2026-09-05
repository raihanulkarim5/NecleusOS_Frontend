import type { EntryService } from './entryService';
import type { Entry, EntryDraft, EntryUpdate } from '../types/entry';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const today = () => new Date().toISOString().slice(0, 10);

let entries: Entry[] = [
  {
    id: 'ent-1',
    title: 'Implement Kanban board for Tasks',
    description: 'Add Kanban view with Open → In Progress → Done → Archived columns, drag-and-drop support.',
    type: 'Note',
    status: 'Done',
    priority: 'High',
    tags: ['frontend', 'ui'],
    dueDate: '2026-08-20',
    links: [],
    favorite: true,
    order: 0,
    createdAt: '2026-08-15',
    updatedAt: today(),
  },
  {
    id: 'ent-2',
    title: 'Design database schema for Finance module',
    description: 'Bank accounts, encrypted credentials, expenses, budgets, debt tracking with person info.',
    type: 'Decision',
    status: 'In Progress',
    priority: 'High',
    tags: ['backend', 'design'],
    dueDate: '2026-08-25',
    links: [],
    favorite: false,
    order: 1,
    createdAt: '2026-08-12',
    updatedAt: today(),
  },
  {
    id: 'ent-3',
    title: 'Problem: Modal stacking context bug',
    description: 'Modals are trapped below navbar due to CSS stacking context. Solution: use createPortal to document.body.',
    type: 'Problem',
    status: 'Done',
    priority: 'High',
    tags: ['bug', 'css'],
    dueDate: null,
    links: [],
    favorite: false,
    order: 2,
    createdAt: '2026-08-10',
    updatedAt: '2026-08-11',
  },
  {
    id: 'ent-4',
    title: 'Meeting: Frontend architecture review',
    description: 'Discussed state management, TanStack Query patterns, component organization. Agreed on setQueryData for mutations.',
    type: 'Meeting Note',
    status: 'Done',
    priority: 'Medium',
    tags: ['meeting', 'architecture'],
    dueDate: '2026-08-16',
    links: [],
    favorite: false,
    order: 3,
    createdAt: '2026-08-16',
    updatedAt: '2026-08-16',
  },
  {
    id: 'ent-5',
    title: 'Idea: Cross-module link picker modal',
    description: 'Build reusable modal for creating links between any two entities. Needed for Tasks, Journal, Entries, Finance, etc.',
    type: 'Idea',
    status: 'Open',
    priority: 'Medium',
    tags: ['feature', 'ui'],
    dueDate: null,
    links: [],
    favorite: false,
    order: 4,
    createdAt: '2026-08-14',
    updatedAt: '2026-08-14',
  },
  {
    id: 'ent-6',
    title: 'Reminder: Review GitHub commits before pushing',
    description: 'Always fetch origin main, check for conflicts, verify build passes before git push.',
    type: 'Reminder',
    status: 'Open',
    priority: 'Low',
    tags: ['ops', 'workflow'],
    dueDate: null,
    links: [],
    favorite: false,
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
      status: 'Open',
      links: [],
      favorite: false,
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
