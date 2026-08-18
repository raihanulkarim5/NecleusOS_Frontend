import type { LinkRef } from './link';

export type ProjectStatus = 'Active' | 'Archived';

export interface Milestone {
  id: string;
  title: string;
  done: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progressPercent: number;
  milestones: Milestone[];
  links: LinkRef[]; // connects to Tasks, Journal entries, and Entries via the shared Link system
  tags: string[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDraft {
  name: string;
  description: string;
  tags: string[];
}
