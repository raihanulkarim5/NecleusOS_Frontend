import type { RoadmapDraft, Skill, SkillDraft, SkillRoadmap } from '../types/skill';

export interface SkillService {
  getSkills(): Promise<Skill[]>;
  getSkill(id: string): Promise<Skill | null>;
  getRoadmaps(): Promise<SkillRoadmap[]>;
  createRoadmap(draft: RoadmapDraft): Promise<SkillRoadmap>;
  createSkill(draft: SkillDraft): Promise<Skill>;
  toggleSyllabusItem(skillId: string, itemId: string): Promise<Skill>;
  addSyllabusItem(skillId: string, title: string): Promise<Skill>;
  toggleMilestone(skillId: string, milestoneId: string): Promise<Skill>;
  addMilestone(skillId: string, title: string): Promise<Skill>;
  addResource(skillId: string, title: string, url: string, type: 'Link' | 'PDF'): Promise<Skill>;
  addCourse(skillId: string, title: string, provider: string, url: string): Promise<Skill>;
  addVideo(skillId: string, title: string, url: string): Promise<Skill>;
  addPracticeTask(skillId: string, taskId: string, taskTitle: string): Promise<Skill>;
  toggleFavorite(id: string): Promise<Skill>;
  updateNotes(id: string, notes: string): Promise<Skill>;
}
