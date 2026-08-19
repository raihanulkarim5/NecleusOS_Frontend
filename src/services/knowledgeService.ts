import type { KnowledgeDraft, KnowledgeItem } from '../types/knowledge';

export interface KnowledgeService {
  getItems(): Promise<KnowledgeItem[]>;
  createItem(draft: KnowledgeDraft): Promise<KnowledgeItem>;
}
