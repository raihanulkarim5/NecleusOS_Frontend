import type { Project, ProjectDraft, ProjectStatus } from '../types/project';

export interface ProjectService {
  getProjects(): Promise<Project[]>;
  createProject(draft: ProjectDraft): Promise<Project>;
  updateStatus(id: string, status: ProjectStatus): Promise<Project>;
  toggleMilestone(projectId: string, milestoneId: string): Promise<Project>;
  toggleFavorite(id: string): Promise<Project>;
}
