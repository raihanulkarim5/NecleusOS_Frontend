import type { LinkRef } from './link';

export type KnowledgeCategory = 'Technical' | 'Office' | 'Personal' | 'Research';

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string; // rich HTML from RichNotesEditor
  category: KnowledgeCategory;
  folder: string | null;
  tags: string[];
  favorite: boolean;
  links: LinkRef[];
  order: number;
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

export interface KnowledgeUpdate {
  title?: string;
  content?: string;
  category?: KnowledgeCategory;
  folder?: string | null;
  tags?: string[];
  favorite?: boolean;
  links?: LinkRef[];
}
