import type { LinkRef } from '../types/link';
import type { RoadmapDraft, Skill, SkillDraft, SkillRoadmap } from '../types/skill';

export interface SkillService {
  getSkills(): Promise<Skill[]>;
  getSkill(id: string): Promise<Skill | null>;
  getRoadmaps(): Promise<SkillRoadmap[]>;
  createRoadmap(draft: RoadmapDraft): Promise<SkillRoadmap>;
  createSkill(draft: SkillDraft): Promise<Skill>;
  updateDescription(id: string, description: string): Promise<Skill>;

  toggleMilestone(skillId: string, milestoneId: string): Promise<Skill>;
  addMilestone(skillId: string, title: string): Promise<Skill>;
  removeMilestone(skillId: string, milestoneId: string): Promise<Skill>;
  addProjectToMilestone(skillId: string, milestoneId: string, projectRef: LinkRef): Promise<Skill>;
  removeProjectFromMilestone(skillId: string, milestoneId: string, projectId: string): Promise<Skill>;

  // Syllabus points/tasks live inside a milestone.
  toggleSyllabusItem(skillId: string, milestoneId: string, itemId: string): Promise<Skill>;
  addSyllabusItem(skillId: string, milestoneId: string, title: string): Promise<Skill>;
  removeSyllabusItem(skillId: string, milestoneId: string, itemId: string): Promise<Skill>;
  updateSyllabusItemDetails(skillId: string, milestoneId: string, itemId: string, details: string): Promise<Skill>;
  addProjectToSyllabusItem(skillId: string, milestoneId: string, itemId: string, projectRef: LinkRef): Promise<Skill>;
  removeProjectFromSyllabusItem(skillId: string, milestoneId: string, itemId: string, projectId: string): Promise<Skill>;

  addResource(skillId: string, title: string, url: string, type: 'Link' | 'PDF', isUpload: boolean): Promise<Skill>;
  removeResource(skillId: string, resourceId: string): Promise<Skill>;
  addCourse(skillId: string, title: string, provider: string, url: string): Promise<Skill>;
  removeCourse(skillId: string, courseId: string): Promise<Skill>;
  addVideo(skillId: string, title: string, url: string): Promise<Skill>;
  removeVideo(skillId: string, videoId: string): Promise<Skill>;
  addPracticeTask(skillId: string, taskId: string, taskTitle: string): Promise<Skill>;
  removePracticeTask(skillId: string, taskId: string): Promise<Skill>;

  linkProject(skillId: string, projectRef: LinkRef): Promise<Skill>;
  unlinkProject(skillId: string, projectId: string): Promise<Skill>;

  toggleFavorite(id: string): Promise<Skill>;
  updateNotes(id: string, notes: string): Promise<Skill>;
}
