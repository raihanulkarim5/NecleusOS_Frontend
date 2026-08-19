import type { InboxItem } from '../types/inbox';

export interface InboxService {
  getItems(): Promise<InboxItem[]>;
  addItem(content: string): Promise<InboxItem>;
  removeItem(id: string): Promise<void>;
}
