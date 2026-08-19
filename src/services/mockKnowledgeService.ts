import type { KnowledgeService } from './knowledgeService';
import type { KnowledgeDraft, KnowledgeItem } from '../types/knowledge';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const today = () => new Date().toISOString().slice(0, 10);

let items: KnowledgeItem[] = [
  {
    id: 'k1',
    title: 'SQL Joins',
    content: 'INNER, LEFT, RIGHT, FULL — quick reference with examples from GrsSimp queries.',
    category: 'Technical',
    folder: 'SQL',
    tags: ['sql', 'reference'],
    links: [],
    createdAt: '2026-06-01',
    updatedAt: '2026-08-10',
  },
  {
    id: 'k2',
    title: 'SQL Indexes',
    content: 'When to add a covering index vs. a composite index; notes from optimizing report queries.',
    category: 'Technical',
    folder: 'SQL',
    tags: ['sql', 'performance'],
    links: [],
    createdAt: '2026-06-05',
    updatedAt: '2026-08-12',
  },
  {
    id: 'k3',
    title: 'Stored Procedures',
    content: 'Patterns for parameterized stored procs used in Crystal Reports.',
    category: 'Technical',
    folder: 'SQL',
    tags: ['sql'],
    links: [],
    createdAt: '2026-06-10',
    updatedAt: '2026-08-13',
  },
  {
    id: 'k4',
    title: 'Query Optimization',
    content: 'Execution plan reading, index usage, avoiding table scans.',
    category: 'Technical',
    folder: 'SQL',
    tags: ['sql', 'performance'],
    links: [],
    createdAt: '2026-06-15',
    updatedAt: '2026-08-14',
  },
  {
    id: 'k5',
    title: 'TanStack Query cache keys',
    content: 'Convention used across Personal OS: [module, entity, id?] for consistent invalidation.',
    category: 'Technical',
    folder: 'React',
    tags: ['react', 'personal-os'],
    links: [],
    createdAt: '2026-08-01',
    updatedAt: today(),
  },
  {
    id: 'k6',
    title: 'Team standup format',
    content: "What I did, what I'm doing, blockers — five minutes max per person.",
    category: 'Office',
    folder: null,
    tags: ['process'],
    links: [],
    createdAt: '2026-07-01',
    updatedAt: '2026-07-01',
  },
];

export const mockKnowledgeService: KnowledgeService = {
  async getItems(): Promise<KnowledgeItem[]> {
    await delay(400);
    return [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async createItem(draft: KnowledgeDraft): Promise<KnowledgeItem> {
    await delay(400);
    const now = today();
    const item: KnowledgeItem = { id: `k${Date.now()}`, ...draft, links: [], createdAt: now, updatedAt: now };
    items = [item, ...items];
    return item;
  },
};
