import type { KnowledgeService } from './knowledgeService';
import type { KnowledgeItem, KnowledgeDraft, KnowledgeUpdate } from '../types/knowledge';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const today = () => new Date().toISOString().slice(0, 10);

let items: KnowledgeItem[] = [
  {
    id: 'kb-1',
    title: 'TanStack Query — setQueryData cheatsheet',
    content: '<p>Use <code>queryClient.setQueryData(key, updater)</code> to write straight into the cache after a mutation instead of <code>invalidateQueries</code> everywhere — instant UI updates, no refetch.</p><pre>queryClient.setQueryData([\'tasks\'], (old) =&gt; old.map(t =&gt; t.id === updated.id ? updated : t));</pre>',
    category: 'Technical',
    folder: 'React / TanStack',
    tags: ['react', 'tanstack-query'],
    favorite: true,
    links: [],
    order: 0,
    createdAt: '2026-08-01',
    updatedAt: today(),
  },
  {
    id: 'kb-2',
    title: 'Modal stacking context — always use a portal',
    content: '<p><code>.shell-content</code> sets <code>position: relative</code> and creates a stacking context, which traps any child z-index below the fixed nav bar. Modals must render via <code>createPortal(..., document.body)</code> to escape it.</p>',
    category: 'Technical',
    folder: 'React / TanStack',
    tags: ['css', 'react', 'bug'],
    favorite: false,
    links: [],
    order: 1,
    createdAt: '2026-08-05',
    updatedAt: '2026-08-05',
  },
  {
    id: 'kb-3',
    title: 'GrsSimp — Crystal Reports export gotcha',
    content: '<p>Exporting a Crystal Report to PDF from Razor Pages needs the response buffer cleared first, or the export gets prefixed with partial page markup. Call <code>Response.Clear()</code> before writing the export stream.</p>',
    category: 'Office',
    folder: 'GrsSimp (work)',
    tags: ['crystal-reports', 'razor-pages'],
    favorite: false,
    links: [],
    order: 2,
    createdAt: '2026-07-20',
    updatedAt: '2026-07-20',
  },
  {
    id: 'kb-4',
    title: 'SQL Server — reset identity seed',
    content: '<pre>DBCC CHECKIDENT (\'TableName\', RESEED, 0);</pre><p>Useful after bulk-deleting test rows so the next insert starts back at 1.</p>',
    category: 'Technical',
    folder: 'SQL Server',
    tags: ['sql-server'],
    favorite: true,
    links: [],
    order: 3,
    createdAt: '2026-07-10',
    updatedAt: '2026-07-10',
  },
  {
    id: 'kb-5',
    title: 'Codespaces — port forwarding needs server.host',
    content: '<p>Vite dev server must set <code>server: { host: true }</code> in <code>vite.config.ts</code>, or Codespaces port forwarding won\'t reach it.</p>',
    category: 'Technical',
    folder: 'Dev environment',
    tags: ['vite', 'codespaces'],
    favorite: false,
    links: [],
    order: 4,
    createdAt: '2026-08-02',
    updatedAt: '2026-08-02',
  },
  {
    id: 'kb-6',
    title: 'Apartment hunting — must-haves list',
    content: '<p>Near a bus line, in-unit laundry, and a kitchen big enough for two people to cook at once. Budget ceiling stays firm regardless of finishes.</p>',
    category: 'Personal',
    folder: null,
    tags: ['personal'],
    favorite: false,
    links: [],
    order: 5,
    createdAt: '2026-06-15',
    updatedAt: '2026-06-15',
  },
];

export const mockKnowledgeService: KnowledgeService = {
  async getItems() {
    await delay(400);
    return [...items].sort((a, b) => a.order - b.order);
  },

  async getItem(id: string) {
    await delay(200);
    const item = items.find(i => i.id === id);
    if (!item) throw new Error('Knowledge item not found');
    return { ...item };
  },

  async createItem(draft: KnowledgeDraft) {
    await delay(400);
    const newItem: KnowledgeItem = {
      ...draft,
      id: `kb-${Date.now()}`,
      favorite: false,
      links: [],
      order: items.length,
      createdAt: today(),
      updatedAt: today(),
    };
    items.push(newItem);
    return newItem;
  },

  async updateItem(id: string, updates: KnowledgeUpdate) {
    await delay(300);
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Knowledge item not found');
    const updated: KnowledgeItem = { ...items[idx], ...updates, id, createdAt: items[idx].createdAt, updatedAt: today() };
    items[idx] = updated;
    return { ...updated };
  },

  async deleteItem(id: string) {
    await delay(300);
    items = items.filter(i => i.id !== id);
  },
};
