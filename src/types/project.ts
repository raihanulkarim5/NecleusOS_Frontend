import type { LinkRef } from './link';

export type ProjectStatus = 'Active' | 'Archived';

// Decisions, Problems, and Solutions are Entries under the hood (that's
// exactly what those Entry types are for) — Tasks and Journal point to
// their own real modules. Every category here is a plain LinkRef list.
export type ProjectLinkCategory = 'tasks' | 'decisions' | 'problems' | 'solutions' | 'journal';

export interface Milestone {
  id: string;
  title: string;
  done: boolean;
}

export interface ProjectResource {
  id: string;
  title: string;
  url: string;
}

export interface ProjectFile {
  id: string;
  title: string;
  url: string; // blob URL from a real file upload
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
  solutions: LinkRef[];
  journalEntries: LinkRef[];
  resources: ProjectResource[];
  files: ProjectFile[];
  notes: string; // HTML from the rich notes editor
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
