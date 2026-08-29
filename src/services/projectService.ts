import type { LinkRef } from '../types/link';
import type { Project, ProjectDraft, ProjectLinkCategory, ProjectStatus } from '../types/project';

export interface ProjectService {
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  createProject(draft: ProjectDraft): Promise<Project>;
  createFromTemplate(templateId: string, name: string): Promise<Project>;
  updateBasicInfo(
    id: string,
    info: { name: string; description: string; status: ProjectStatus; tags: string[] },
  ): Promise<Project>;
  toggleTemplate(id: string): Promise<Project>;
  toggleFavorite(id: string): Promise<Project>;

  toggleMilestone(projectId: string, milestoneId: string): Promise<Project>;
  addMilestone(projectId: string, title: string): Promise<Project>;
  removeMilestone(projectId: string, milestoneId: string): Promise<Project>;
  moveMilestone(projectId: string, milestoneId: string, direction: 'up' | 'down'): Promise<Project>;

  addLinkedItem(projectId: string, category: ProjectLinkCategory, ref: LinkRef): Promise<Project>;
  removeLinkedItem(projectId: string, category: ProjectLinkCategory, refId: string): Promise<Project>;

  addResource(projectId: string, title: string, url: string): Promise<Project>;
  removeResource(projectId: string, resourceId: string): Promise<Project>;

  addFile(projectId: string, title: string, url: string): Promise<Project>;
  removeFile(projectId: string, fileId: string): Promise<Project>;

  updateNotes(projectId: string, notes: string): Promise<Project>;
}
