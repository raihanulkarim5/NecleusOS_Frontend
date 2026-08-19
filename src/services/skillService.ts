import type { Skill, SkillDraft } from '../types/skill';

export interface SkillService {
  getSkills(): Promise<Skill[]>;
  createSkill(draft: SkillDraft): Promise<Skill>;
  toggleRoadmapItem(skillId: string, itemId: string): Promise<Skill>;
  toggleFavorite(id: string): Promise<Skill>;
}
