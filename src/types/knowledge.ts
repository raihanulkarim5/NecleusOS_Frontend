import type { LinkRef } from './link';

export type KnowledgeCategory = 'Technical' | 'Office' | 'Personal' | 'Research';

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: KnowledgeCategory;
  folder: string | null;
  tags: string[];
  links: LinkRef[];
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeDraft {
  title: string;
  content: string;
  category: KnowledgeCategory;
  folder: string | null;
  tags: string[];
}
