import type { ProjectService } from './projectService';
import type { Project, ProjectDraft, ProjectStatus } from '../types/project';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const today = () => new Date().toISOString().slice(0, 10);

function computeProgress(milestones: { done: boolean }[]): number {
  if (milestones.length === 0) return 0;
  return Math.round((milestones.filter((m) => m.done).length / milestones.length) * 100);
}

let projects: Project[] = [
  {
    id: 'p1',
    name: 'Personal OS',
    description: 'React frontend, .NET Core API, SQL Server — module by module against dummy data first.',
    status: 'Active',
    progressPercent: 60,
    milestones: [
      { id: 'm1', title: 'Auth + Dashboard shell', done: true },
      { id: 'm2', title: 'Entries, Tasks, Journal, Finance', done: true },
      { id: 'm3', title: 'Projects, Skills, Knowledge Base', done: false },
      { id: 'm4', title: '.NET Core API + real auth', done: false },
      { id: 'm5', title: 'Flutter mobile', done: false },
    ],
    links: [
      { type: 'task', id: 'tk1', title: 'Build Task module UI' },
      { type: 'journal', id: 'j3', title: 'Reviewed the Entries vs. module-specific decision' },
      { type: 'entry', id: 'e4', title: 'Personal OS' },
    ],
    tags: ['flagship'],
    favorite: true,
    createdAt: '2026-07-20',
    updatedAt: today(),
  },
  {
    id: 'p2',
    name: 'ERP System',
    description: 'GrsSimp — internal ERP with Crystal Reports and Razor Pages.',
    status: 'Active',
    progressPercent: 80,
    milestones: [
      { id: 'm6', title: 'Core modules', done: true },
      { id: 'm7', title: 'Reporting layer', done: true },
      { id: 'm8', title: 'Middleware refactor', done: false },
    ],
    links: [
      { type: 'task', id: 'tk5', title: 'Fix Bug #142 in Crystal Report export' },
    ],
    tags: ['work'],
    favorite: false,
    createdAt: '2025-11-01',
    updatedAt: '2026-08-14',
  },
  {
    id: 'p3',
    name: 'AI Assistant',
    description: 'Exploring an optional AI plug-in layer for Personal OS — bring-your-own API key.',
    status: 'Active',
    progressPercent: 10,
    milestones: [
      { id: 'm9', title: 'Scope the plug-in interface', done: false },
    ],
    links: [],
    tags: ['research'],
    favorite: false,
    createdAt: '2026-08-05',
    updatedAt: '2026-08-05',
  },
];

export const mockProjectService: ProjectService = {
  async getProjects(): Promise<Project[]> {
    await delay(400);
    return [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async createProject(draft: ProjectDraft): Promise<Project> {
    await delay(400);
    const now = today();
    const project: Project = {
      id: `p${Date.now()}`,
      ...draft,
      status: 'Active',
      progressPercent: 0,
      milestones: [],
      links: [],
      favorite: false,
      createdAt: now,
      updatedAt: now,
    };
    projects = [project, ...projects];
    return project;
  },

  async updateStatus(id: string, status: ProjectStatus): Promise<Project> {
    await delay(300);
    projects = projects.map((p) => (p.id === id ? { ...p, status, updatedAt: today() } : p));
    const updated = projects.find((p) => p.id === id);
    if (!updated) throw new Error('Project not found');
    return updated;
  },

  async toggleMilestone(projectId: string, milestoneId: string): Promise<Project> {
    await delay(200);
    projects = projects.map((p) => {
      if (p.id !== projectId) return p;
      const milestones = p.milestones.map((m) => (m.id === milestoneId ? { ...m, done: !m.done } : m));
      return { ...p, milestones, progressPercent: computeProgress(milestones), updatedAt: today() };
    });
    const updated = projects.find((p) => p.id === projectId);
    if (!updated) throw new Error('Project not found');
    return updated;
  },

  async toggleFavorite(id: string): Promise<Project> {
    await delay(200);
    projects = projects.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p));
    const updated = projects.find((p) => p.id === id);
    if (!updated) throw new Error('Project not found');
    return updated;
  },
};
