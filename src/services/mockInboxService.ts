import type { InboxService } from './inboxService';
import type { InboxItem } from '../types/inbox';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let items: InboxItem[] = [
  { id: 'ib1', content: 'Look into Bootstrap-only vs galaxy theme conflict for the design doc', createdAt: '2026-08-17' },
  { id: 'ib2', content: 'Ask about renewing the GitHub token before it expires', createdAt: '2026-08-17' },
  { id: 'ib3', content: 'Idea: Skills roadmap could double as onboarding checklist for new modules', createdAt: '2026-08-16' },
];

export const mockInboxService: InboxService = {
  async getItems(): Promise<InboxItem[]> {
    await delay(300);
    return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async addItem(content: string): Promise<InboxItem> {
    await delay(250);
    const item: InboxItem = { id: `ib${Date.now()}`, content, createdAt: new Date().toISOString().slice(0, 10) };
    items = [item, ...items];
    return item;
  },

  async removeItem(id: string): Promise<void> {
    await delay(150);
    items = items.filter((i) => i.id !== id);
  },
};
