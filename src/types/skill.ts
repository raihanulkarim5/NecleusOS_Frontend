export interface RoadmapItem {
  id: string;
  title: string;
  done: boolean;
}

export interface Skill {
  id: string;
  name: string;
  progressPercent: number;
  roadmap: RoadmapItem[];
  resources: string[];
  tags: string[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SkillDraft {
  name: string;
  tags: string[];
}
