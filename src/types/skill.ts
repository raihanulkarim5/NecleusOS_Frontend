import type { LinkRef } from './link';

export type SkillStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface SyllabusItem {
  id: string;
  title: string;
  done: boolean;
}

export interface SkillResource {
  id: string;
  title: string;
  url: string;
  type: 'Link' | 'PDF';
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

export interface Skill {
  id: string;
  name: string;
  category: string;
  status: SkillStatus;
  progressPercent: number;
  roadmapId: string | null;
  syllabus: SyllabusItem[];
  resources: SkillResource[];
  courses: SkillCourse[];
  videos: SkillVideo[];
  practiceTasks: LinkRef[];
  notes: string;
  projects: LinkRef[];
  milestones: SkillMilestone[];
  tags: string[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SkillDraft {
  name: string;
  category: string;
  roadmapId: string | null;
  tags: string[];
}
