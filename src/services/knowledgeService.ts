import type { KnowledgeDraft, KnowledgeItem, KnowledgeUpdate } from '../types/knowledge';

export interface KnowledgeService {
  getItems(): Promise<KnowledgeItem[]>;
  getItem(id: string): Promise<KnowledgeItem>;
  createItem(draft: KnowledgeDraft): Promise<KnowledgeItem>;
  updateItem(id: string, updates: KnowledgeUpdate): Promise<KnowledgeItem>;
  deleteItem(id: string): Promise<void>;
}
