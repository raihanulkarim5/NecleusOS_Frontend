import type { LinkRef } from './link';

export type SkillStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface SyllabusItem {
  id: string;
  title: string;
  done: boolean;
  projectRef: LinkRef | null;
}

export interface SkillResource {
  id: string;
  title: string;
  url: string;
  type: 'Link' | 'PDF';
  isUpload: boolean; // true when url is a local blob URL from a file upload rather than an external link
}

export interface SkillCourse {
  id: string;
  title: string;
  provider: string;
  url: string;
}

export interface SkillVideo {
  id: string;
  title: string;
  url: string;
}

export interface SkillMilestone {
  id: string;
  title: string;
  done: boolean;
  projectRef: LinkRef | null;
}

// A Roadmap is a distinct entity from a skill's own syllabus — it's a
// named learning path that groups several skills together in order
// (e.g. "Backend developer path": ASP.NET Core -> EF Core -> SQL Server).
// A skill's roadmapId is optional; most skills belong to none.
export interface SkillRoadmap {
  id: string;
  name: string;
  description: string;
  skillIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapDraft {
  name: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  status: SkillStatus;
  progressPercent: number;
  roadmapId: string | null;
  syllabus: SyllabusItem[];
  resources: SkillResource[];
  courses: SkillCourse[];
  videos: SkillVideo[];
  practiceTasks: LinkRef[];
  notes: string; // stores HTML from the rich notes editor
  projects: LinkRef[];
  milestones: SkillMilestone[];
  tags: string[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SkillDraft {
  name: string;
  description: string;
  category: string;
  roadmapId: string | null;
  tags: string[];
}
