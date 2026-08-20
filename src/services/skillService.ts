import type { Skill, SkillDraft, SkillRoadmap } from '../types/skill';

export interface SkillService {
  getSkills(): Promise<Skill[]>;
  getSkill(id: string): Promise<Skill | null>;
  getRoadmaps(): Promise<SkillRoadmap[]>;
  createSkill(draft: SkillDraft): Promise<Skill>;
  toggleSyllabusItem(skillId: string, itemId: string): Promise<Skill>;
  toggleMilestone(skillId: string, milestoneId: string): Promise<Skill>;
  toggleFavorite(id: string): Promise<Skill>;
  updateNotes(id: string, notes: string): Promise<Skill>;
}
