import type { LinkRef } from './link';

export type ProjectStatus = 'Active' | 'Archived';

export type ProjectLinkCategory = 'tasks' | 'decisions' | 'problems' | 'journal';

export interface Milestone {
  id: string;
  title: string;
  done: boolean;
  tasks: LinkRef[];
}

export interface ProjectResource {
  id: string;
  title: string;
  url: string;
}

export interface ProjectFile {
  id: string;
  title: string;
  url: string;
  uploadedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progressPercent: number;
  isTemplate: boolean;
  milestones: Milestone[];
  tasks: LinkRef[];
  decisions: LinkRef[];
  problems: LinkRef[];
  journalEntries: LinkRef[];
  resources: ProjectResource[];
  files: ProjectFile[];
  notes: string;
  tags: string[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDraft {
  name: string;
  description: string;
  tags: string[];
  isTemplate?: boolean;
}
